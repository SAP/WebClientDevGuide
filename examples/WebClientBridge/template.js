window.sapcai.webclientBridge = {

  getApplicationId: () => {
    return 'myapp-id'
  },

  getMemory: () => {
    return {
      memory: {
        // all memory keys to be sent with the next message
      },
      merge: false,
    }
  },

  getChannelPreferences: () => {
    return {
      // all preferences to be overwritten dynamically
      // accentColor: '',
      // botMessageBackgroundColor: '',
      // botMessageColor: '',
      // complementaryColor: '',
      // backgroundColor: '',
      // headerTitle: '',
      // userInputPlaceholder: '',
      // botPicture: '',
      // userPicture: '',
      // welcomeMessage: '',
    }
  },

  onMessage: (payload) => {
    const { messages } = payload
    // do something with incoming bot responses
  },

  getClientInfo: (defaults) => {
    // called once when the WebClient is loaded, return user and client settings
    return {
      language: 'fr', // For example, overwrite language to french, remain default for the rest
      ...defaults,
    }
  },

  // if this function returns an object, WebClient will enable the microphone button and assume STT is enabled.
  sttGetConfig: async () => {
    return {
      useMediaRecorder: true, // use browser built in MediaRecorder spec to record audio
      interimResultTime: 50, // milliseconds,
      audioMetaData: { // audio format that the audio will be recorded in 
        // any codec supported by the browser MediaRecorder spec
        type: 'audio/ogg;codecs=opus',
        fileFormat: 'ogg',
        encoding: 'opus',
      }
    }
  },

  sttStartListening: async (params) => {
    const [metadata] = params
    const { language, audioMetadata } = metadata
 
    // initialize your STT service session, e.g. creating a WebSocket client and registering callbacks
  },

  sttStopListening: async () => {
    // close current STT session after, usually after a small timeout to allow for any ongoing transcription to finish
  },

  sttAbort: async () => {
    // immediately close current STT session
  },

  // only called if useMediaRecorder = true in sttGetConfig
  sttOnFinalAudioData: async (params) => {
    const [blob, metadata] = params
    // send final blob to STT service
  },

  // only called if useMediaRecorder = true in sttGetConfig
  sttOnInterimAudioData: async (params) => {
    const [blob, metadata] = params
    // send interim blob to STT service 
  }

}