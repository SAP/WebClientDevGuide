class PCMProcessor extends AudioWorkletProcessor {
  constructor (options) {
    super()

    // eslint-disable-next-line no-undef
    this.outputAudioBuffer = new Float32Array()
    this.samplerate = options.processorOptions.samplerate
    this.chunksize = Math.floor(0.01 * this.samplerate)
    // eslint-disable-next-line no-undef
    this.buffer = new Float32Array()
    this.format = 'PCM32'
    if ('format' in options.processorOptions) {
      this.format = options.processorOptions.format
    }
    this.counter = 0
  }

  process (inputs, outputs, parameters) {
    // update buffer
    const input0 = inputs[0]
    const input0Channel0 = input0[0]
    if (input0Channel0 !== null && input0Channel0 !== undefined) {
      if (this.buffer.length > 0) {
        // eslint-disable-next-line no-undef
        const tmp_buffer = new Float32Array(this.buffer.length + input0Channel0.length)
        tmp_buffer.set(this.buffer)
        tmp_buffer.set(input0Channel0, this.buffer.length)
        this.buffer = tmp_buffer
      } else {
        this.buffer = input0Channel0
      }
      // send processed chunk
      while (this.buffer.length > this.chunksize) {
        const chunk = this.buffer.slice(0, this.chunksize)
        this.buffer = this.buffer.slice(this.chunksize)

        if (this.format === 'PCM16') {
          // eslint-disable-next-line no-undef
          const chunk16 = new Int16Array(chunk.length)
          for (let i = 0; i < chunk.length; i++) {
            chunk16[i] = chunk[i] * 32767
          }
          this.port.postMessage(
            // eslint-disable-next-line no-undef
            String.fromCharCode.apply(null, new Uint8Array(chunk16.buffer))
          )
        } else if (this.format === 'PCM32') {
          this.port.postMessage(
            // eslint-disable-next-line no-undef
            String.fromCharCode.apply(null, new Uint8Array(chunk.buffer))
          )
        }
      }
    }

    // Return 'true' to mark this processor as still active, so that it is kept alive.
    return true
  }
}

registerProcessor('pcm-processor', PCMProcessor)
console.log('registered pcm-processor')
