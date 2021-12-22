/* eslint-disable require-await */
const _ = require('lodash')

const SPEAKER_URL = 'www.speaker-plattform.de/speaker.beta2.SpeechRecognition/transcribe'
const access_token = 'previously obtained access token from SPEAKER platform'

class PCM16AudioRecorder {

  async initAudio (stream, ondata) {
    // set up audio context and source
    try {
      // this is needed because Firefox does not seem to support AudioContexts with samplerates other than the default samplerate
      this.context = new AudioContext({
        sampleRate: 16000,
      })
      // see file 'pcm_processor.js' in this examples folder
      await this.context.audioWorklet.addModule('pcm_processor.js')
      
      this.audioSource = this.context.createMediaStreamSource(stream)
    } catch (e) {
      console.log('Could not set samplerate to 16000, using default.')
      this.context = new AudioContext()
      await this.context.audioWorklet.addModule('pcm_processor.js')
      this.audioSource = this.context.createMediaStreamSource(stream)
    }
    this.pcmNode = new window.AudioWorkletNode(this.context, 'pcm-processor', {
      processorOptions: {
        samplerate: this.context.sampleRate,
        format: 'PCM16',
      },
    })
    this.pcmNode.port.onmessage = (event) => {
      if (typeof ondata === 'function') {
        ondata(event.data)
      }
    }
    // connect audio processing nodes
    this.audioSource.connect(this.pcmNode)
    this.pcmNode.connect(this.context.destination)
  }

  async start (ondata) {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })
    await this.initAudio(this.stream, ondata)
  }

  stop () {
    // close audio nodes
    if (this.pcmNode) { this.pcmNode.disconnect() }
    if (this.audioSource) { this.audioSource.disconnect() }
    this.pcmNode = null
    this.audioSource = null
    // close client to backend
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop()
      })
    }
    this.stream = null
  }
}

let wsclient = null
let audioRecorder = null
window.sapcai.webclientBridge = {

  sttGetConfig: async () => {
    return {
      useMediaRecorder: false,
      interimResultTime: 1,
    }
  },

  sttStartListening: async (params) => {
    const [metadata] = params
    const { language } = metadata
    const sttConfig = await sttSpeakerWebSockets.sttGetConfig()
    const intermediateResults = _.get(sttConfig, 'interimResultTime', 0) > 0
    wsclient = new WebSocket(`wss://${SPEAKER_URL}?access_token=${access_token}&service=asr-de&namespace=speaker`)
    bytesSum = 0
    wsclient.onopen = (event) => {
      wsclient.send(
        JSON.stringify({
          config: {
            language,
            intermediateResults,
            audioFormat: {
              encoding: 'PCM16',
              samplerate: 16000,
            },
          },
        }))
    }

    wsclient.onmessage = (event) => {
      console.log('OnMessage')
      const data = JSON.parse(event.data)
      if (data.text) {
        const m = {
          text: data.text,
          final: data.utteranceFinished === true,
        }
        window.sap.cai.webclient.onSTTResult(m)
      }
    }

    wsclient.onclose = (event) => {
      console.log('OnClose')
      console.log(JSON.stringify(event))
    }

    wsclient.onerror = (event) => {
      console.log('OnError', JSON.stringify(event.data))
    }

    audioRecorder = new PCM16AudioRecorder()
    await audioRecorder.start((data) => {
      if (wsclient && wsclient.readyState === WebSocket.OPEN) {
        wsclient.send(
          JSON.stringify({
            audio: btoa(data),
          })
        )
      }
    })
  },

  sttStopListening: async () => {
    console.log('StopListening')
    if (audioRecorder) {
      audioRecorder.stop()
      audioRecorder = null
    }
    const client = wsclient
    setTimeout(() => {
      if (client) {
        client.close()
      }
    }, 5000)
  },

  sttAbort: async () => {
    if (wsclient) {
      wsclient.close()
      wsclient = null
    }
  },
}
