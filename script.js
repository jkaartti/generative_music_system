// Set up recording
const dest = Tone.context.createMediaStreamDestination()
const recorder = new MediaRecorder(dest.stream)
const audioChuncks = []
recorder.ondataavailable = evt => audioChuncks.push(evt.data)
recorder.onstop = evt => {
  let blob = new Blob(audioChuncks, { type: 'audio/wav; codecs=opus' })
  const url = URL.createObjectURL(blob)
  const audio = document.getElementById('audioPlayer')
  audio.src = url
  const downloadLink = document.getElementById('downloadLink')
  downloadLink.href = url
  downloadLink.download = new Date().toISOString() + '.wav'
}

// Magenta stuff -----

const TEMPERATURE = 0.1
const RNN_CHECKPOINT = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn'
const musicRnn = new mm.MusicRNN(RNN_CHECKPOINT)

// MASTER ------------

const master = new Tone.Volume().toDestination()
master.connect(dest)

// BASS --------------
const bassVolume = new Tone.Volume().connect(master) // For muting
const bassSynth = new Tone.Synth().connect(bassVolume)
bassSynth.volume.value = -3

const bassSynthMeter = new Tone.Meter()
bassSynth.connect(bassSynthMeter)
// -------------------

// DIGIBELL ----------
const digibell = new Tone.Sampler({
  urls: {
    'A2': 'Digibell_A2.mp3',
    'B2': 'Digibell_B2.mp3',
    'D3': 'Digibell_D3.mp3',
    'E3': 'Digibell_E3.mp3',
    'G3': 'Digibell_G3.mp3',
    'A3': 'Digibell_A3.mp3',
    'B3': 'Digibell_B3.mp3',
    'D4': 'Digibell_D4.mp3',
    'E4': 'Digibell_E4.mp3',
    'G4': 'Digibell_G4.mp3',
    'A4': 'Digibell_A4.mp3',
    'B4': 'Digibell_B4.mp3',
    'D5': 'Digibell_D5.mp3',
    'E5': 'Digibell_E5.mp3',
    'G5': 'Digibell_G5.mp3',
  },
  release: 1,
	baseUrl: './Digibell/',
})
digibell.volume.value = -18

const digibellMeter = new Tone.Meter()
digibell.connect(digibellMeter)

const digibellCompressor = new Tone.Compressor(-24, 6).connect(master)
digibell.connect(digibellCompressor)
// -------------------

// MELODY ------------
const melody = new Tone.Sampler({
  urls: {
    'A2': 'Digibell_A2.mp3',
    'B2': 'Digibell_B2.mp3',
    'D3': 'Digibell_D3.mp3',
    'E3': 'Digibell_E3.mp3',
    'G3': 'Digibell_G3.mp3',
    'A3': 'Digibell_A3.mp3',
    'B3': 'Digibell_B3.mp3',
    'D4': 'Digibell_D4.mp3',
    'E4': 'Digibell_E4.mp3',
    'G4': 'Digibell_G4.mp3',
    'A4': 'Digibell_A4.mp3',
    'B4': 'Digibell_B4.mp3',
    'D5': 'Digibell_D5.mp3',
    'E5': 'Digibell_E5.mp3',
    'G5': 'Digibell_G5.mp3',
  },
  release: 1,
	baseUrl: './Digibell/',
})
melody.volume.value = -18

const melodyMeter = new Tone.Meter()
melody.connect(melodyMeter)

const melodyCompressor = new Tone.Compressor(-24, 6).connect(master)
melody.connect(melodyCompressor)
// -------------------

// DRUMS -------------
const drumSampler = new Tone.Sampler({
  urls: {
    'C2':  'kick.wav',
    'D2':  'snare.wav',
    'F#2': 'hihatClosed.wav',
    'A#2': 'hihatOpen.wav',
  },
  release: 1,
	baseUrl: './drs/',
}).connect(master)

drumSampler.volume.value = -7

const drumMeter = new Tone.Meter()
drumSampler.connect(drumMeter)
// -------------------

// REVERB ------------
const rev = new Tone.Reverb(5).connect(master)
digibell.connect(rev)
melody.connect(rev)
const drumRevSend = new Tone.Volume(-18).connect(rev)
drumSampler.connect(drumRevSend)
// -------------------

const digibellPitches = [
  'A2',
  'B2',
  'D3',
  'E3',
  'G3',
  'A3',
  'B3',
  'D4',
  'E4',
  'G4',
  'A4',
  'B4',
  'D5',
  'E5',
  'G5',
]

const digibellTimeValues = [
  '0:1:0',
  '0:1:1',
  '0:1:2',
  '0:1:3',
  '0:2:0',
  '0:2:1',
  '0:2:2',
  '0:2:3',
  '0:3:0',
  '0:3:1',
  '0:3:2',
  '0:3:3',
]

const melodyPitches = [
  'A2',
  'B2',
  'D3',
  'E3',
  'G3',
  'A3',
  'B3',
  'D4',
  'E4',
  'G4',
  'A4',
  'B4',
  'D5',
  'E5',
  'G5',
]

const melodyTimeValues = [
  '0:0:0',
  '0:0:1',
  '0:0:2',
  '0:0:3',
  '0:1:0',
  '0:1:1',
  '0:1:2',
  '0:1:3',
  '0:2:0',
  '0:2:1',
  '0:2:2',
  '0:2:3',
  '0:3:0',
  '0:3:1',
  '0:3:2',
  '0:3:3',
]

const kickProbabilities = {
  probabilityArray: [
    { beat: '0:0:0', probability: 1.0 },
    { beat: '0:0:1', probability: 0.1 },
    { beat: '0:0:2', probability: 0.5 },
    { beat: '0:0:3', probability: 0.1 },
    { beat: '0:1:0', probability: 0.0 },
    { beat: '0:1:1', probability: 0.1 },
    { beat: '0:1:2', probability: 0.5 },
    { beat: '0:1:3', probability: 0.1 },
    { beat: '0:2:0', probability: 0.75 },
    { beat: '0:2:1', probability: 0.1 },
    { beat: '0:2:2', probability: 0.5 },
    { beat: '0:2:3', probability: 0.1 },
    { beat: '0:3:0', probability: 0.0 },
    { beat: '0:3:1', probability: 0.1 },
    { beat: '0:3:2', probability: 0.5 },
    { beat: '0:3:3', probability: 0.1 },
  ],
  duration: '1m'
}

const snareProbabilities = {
  probabilityArray: [
    { beat: '0:0:0', probability: 0.0 },
    { beat: '0:0:1', probability: 0.0 },
    { beat: '0:0:2', probability: 0.1 },
    { beat: '0:0:3', probability: 0.0 },
    { beat: '0:1:0', probability: 0.5 },
    { beat: '0:1:1', probability: 0.0 },
    { beat: '0:1:2', probability: 0.1 },
    { beat: '0:1:3', probability: 0.0 },
    { beat: '0:2:0', probability: 0.7 },
    { beat: '0:2:1', probability: 0.0 },
    { beat: '0:2:2', probability: 0.1 },
    { beat: '0:2:3', probability: 0.0 },
    { beat: '0:3:0', probability: 0.5 },
    { beat: '0:3:1', probability: 0.0 },
    { beat: '0:3:2', probability: 0.1 },
    { beat: '0:3:3', probability: 0.0 },
  ],
  duration: '1m'
}

const hihatClosedProbabilities = {
  probabilityArray: [
    { beat: '0:0:0', probability: 0.9 },
    { beat: '0:0:1', probability: 0.2 },
    { beat: '0:0:2', probability: 0.9 },
    { beat: '0:0:3', probability: 0.2 },
    { beat: '0:1:0', probability: 0.9 },
    { beat: '0:1:1', probability: 0.2 },
    { beat: '0:1:2', probability: 0.9 },
    { beat: '0:1:3', probability: 0.3 },
    { beat: '0:2:0', probability: 0.9 },
    { beat: '0:2:1', probability: 0.2 },
    { beat: '0:2:2', probability: 0.9 },
    { beat: '0:2:3', probability: 0.2 },
    { beat: '0:3:0', probability: 0.9 },
    { beat: '0:3:1', probability: 0.2 },
    { beat: '0:3:2', probability: 0.9 },
    { beat: '0:3:3', probability: 0.3 },
  ],
  duration: '1m'
}

const hihatOpenProbabilities = {
  probabilityArray: [
    { beat: '0:0:0', probability: 0.2 },
    { beat: '0:0:1', probability: 0.05 },
    { beat: '0:0:2', probability: 0.05 },
    { beat: '0:0:3', probability: 0.05 },
    { beat: '0:1:0', probability: 0.05 },
    { beat: '0:1:1', probability: 0.05 },
    { beat: '0:1:2', probability: 0.05 },
    { beat: '0:1:3', probability: 0.05 },
    { beat: '0:2:0', probability: 0.05 },
    { beat: '0:2:1', probability: 0.05 },
    { beat: '0:2:2', probability: 0.05 },
    { beat: '0:2:3', probability: 0.05 },
    { beat: '0:3:0', probability: 0.05 },
    { beat: '0:3:1', probability: 0.05 },
    { beat: '0:3:2', probability: 0.2 },
    { beat: '0:3:3', probability: 0.05 },
  ],
  duration: '1m'
}

const randomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)]
}

const createRandomPattern = (pitches, timeValues) => {
  const minNotes = 1
  const maxNotes = 5

  let notePattern = []

  const numberOfNotes = Math.floor(Math.random() * maxNotes) + minNotes

  for (let i = 0; i < numberOfNotes; i++) {
    const newNote = {
      pitch: randomElement(pitches),
      startTime: randomElement(timeValues),
    }

    notePattern.push(newNote)
  }

  return notePattern
}

const nextRandomMelodyNoteIndex = (pitches, lastIndex, maxChange) => {
  let newIndex = -1
  
  while (newIndex < 0 || pitches.length <= newIndex) {
    let change = 2 * Math.floor(Math.random() * maxChange) - maxChange
    newIndex = lastIndex + change
  }

  return newIndex
}

const createRandomMelody = (pitches, timeValues) => {
  let notePattern = []
  let pitchIndex = Math.floor(Math.random() * pitches.length)

  for (let i = 0; i < timeValues.length; i++) {
    
    // skip some of the timeValues but always include the first
    if (Math.random() < 0.5 && i !== 0) {
      continue
    }

    pitchIndex = nextRandomMelodyNoteIndex(pitches, pitchIndex, 3)

    const newNote = {
      pitch: pitches[pitchIndex],
      startTime: timeValues[i],
    }

    notePattern.push(newNote)
  }

  return notePattern
}

const patternDuration = (pattern) => {
  const maxTimeValue = Math.max(...pattern.map(note => Tone.Transport.toSeconds(note.startTime)))
  return maxTimeValue + Tone.Transport.toSeconds('16n')
}

const convertToMagenta = (notePattern) => {
  const magentaPattern = []
  notePattern.forEach(note => {
    magentaPattern.push({
      pitch: Tone.Midi(note.pitch).toMidi(),
      startTime: Tone.Time(note.startTime).toSeconds(),
      endTime: Tone.Time(note.startTime) + 0.125,
    })
  })
  return magentaPattern
}

const convertFromMagenta = (magentaPattern) => {
  const notePattern = []
  magentaPattern.forEach(note => {
    notePattern.push({
      pitch: Tone.Frequency(note.pitch, 'midi').toNote(),
      startTime: Tone.Time(note.quantizedStartStep / 8).toBarsBeatsSixteenths(),
    })
  })
  return notePattern
}

// TODO: make sure the melody is long enough, at least not an empty array
const generateMagentaMelody = async (melodyPattern, minSumOfNotes = 0) => {
  let sumOfNotes = -1
  let temp = TEMPERATURE
  let sequence
  let counter = 0
  while (sumOfNotes < minSumOfNotes) {
    const magentaPattern = convertToMagenta(melodyPattern)
    const melodyToQuantize = {notes: magentaPattern, totalTime: 4}
    const qns = mm.sequences.quantizeNoteSequence(melodyToQuantize, 4)
    sequence = await musicRnn.continueSequence(qns, 64, temp)
    sumOfNotes = sequence.notes.length
    temp += 0.1
    counter++
  }
  temp -= 0.1
  console.log(`generated magenta melody on try ${counter} with temperature ${temp}`)
  return convertFromMagenta(sequence.notes)
}

const shuffle = (array) => {
  let currentIndex = array.length
  let randomIndex

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]
    ]
  }

  return array
}

const constructDrumPattern = (probabilites) => {
  const constructedPattern = probabilites.probabilityArray
    .filter((p) => Math.random() < p.probability)
    .map(p => (p.beat))

  return constructedPattern
}

const varyDrumPattern = (originalPattern, probabilites, strength) => {
  const newPattern = []
  
  probabilites.probabilityArray.forEach(p => {
    if (originalPattern.includes(p.beat)) {
      if (Math.random() < (1 / strength) * p.probability) {
        newPattern.push(p.beat)
      }
    }
    else if (Math.random() < p.probability * strength) {
      //console.log(p.probability * strength)
      newPattern.push(p.beat)
    }
  })

  return newPattern
}

const removeOverlappingBeats = (originalPattern, comparisonPattern) => {
  return originalPattern.filter(p => !comparisonPattern.includes(p))
}

const playDrumPattern = (pattern, time, note, instrument, comparisonPattern = null) => {
  pattern.forEach(beat => {
       
    //choke hihat
    if (comparisonPattern) {
      for (let i = comparisonPattern.length - 1; i >= 0; i--)
        {
          if (Tone.Time(comparisonPattern[i]) < Tone.Time(beat)) {
            instrument.triggerRelease('A#2', time + Tone.Time(beat))
            i = 0;
          }
        }
      }
    
    //play the note
    instrument.triggerAttack(note, time + Tone.Time(beat))
  })
}

const addToConcatenatedWithOffset = (concatenatedMelody, melody, offset) => {
  melody.forEach(note => {
    concatenatedMelody.push({
      pitch: note.pitch,
      startTime: Tone.Time(Tone.Time(note.startTime) + offset).toBarsBeatsSixteenths()
    })
  })
}

const concatenateToABACMelody = (melody) => {
  const concatenatedMelody = []

  addToConcatenatedWithOffset(concatenatedMelody, melody[0], 0)
  addToConcatenatedWithOffset(concatenatedMelody, melody[1], 2)
  addToConcatenatedWithOffset(concatenatedMelody, melody[0], 4)
  addToConcatenatedWithOffset(concatenatedMelody, melody[2], 6)
  
  // console.log('concatenated:')
  // console.log(concatenatedMelody)

  return concatenatedMelody
}

// Play measures in ABAC pattern
// melody needs to be an array size of 3
const playABACMelody = (melody, startTime, endTime) => {    
  if (melody.length < 2) return

  console.log(melody, startTime, endTime)

  const duration = Tone.Time(endTime) - Tone.Time(startTime)

  Tone.Transport.scheduleRepeat((time) => {
    melody[0].forEach(note => {
      digibell.triggerAttack(note.pitch, Tone.Transport.toSeconds(note.startTime) + time)
    })
  }, Tone.Time('1m') * 4, startTime, duration)

  Tone.Transport.scheduleRepeat((time) => {
    melody[1].forEach(note => {
      digibell.triggerAttack(note.pitch, Tone.Transport.toSeconds(note.startTime) + time)
    })
  }, Tone.Time('1m') * 4, Tone.Time(startTime) + Tone.Time('1m'), duration)

  Tone.Transport.scheduleRepeat((time) => {
    melody[0].forEach(note => {
      digibell.triggerAttack(note.pitch, Tone.Transport.toSeconds(note.startTime) + time)
    })
  }, Tone.Time('1m') * 4, Tone.Time(startTime) + Tone.Time('2m'), duration)

  Tone.Transport.scheduleRepeat((time) => {
    melody[2].forEach(note => {
      digibell.triggerAttack(note.pitch, Tone.Transport.toSeconds(note.startTime) + time)
    })
  }, Tone.Time('1m') * 4, Tone.Time(startTime) + Tone.Time('3m'), duration)
}

const toggleElementVisibility = (element) => {
  const currentDisplay = element.style.display
  if (!currentDisplay || currentDisplay === 'none') {
    element.style.display = 'inline-flex'
  } else {
    element.style.display = 'none'
  }

}

const togglePlayStopVisibilities = () => {
  toggleElementVisibility(document.getElementById('playButton'))
  toggleElementVisibility(document.getElementById('stopButton'))
  toggleElementVisibility(document.getElementById('audioPlayer'))
  toggleElementVisibility(document.getElementById('downloadLink'))
}

const toggleMute = () => {
  master.mute = !master.mute
}

// ================================================== PLAY ==================================================

const play = async () => {
  master.mute = false
  recorder.start()
  
  rev.decay = 5

  document.getElementById('playButton').style.display = 'none'
  document.getElementById('stopButton').style.display = 'inline-flex'
  document.getElementById('audioPlayer').style.display = 'none'
  document.getElementById('downloadLink').style.display = 'none'

  await Tone.start()

  // Digibell ---------------------------------------

  // const digibellPatternStartTimes = [0, 10, 20, 30, 70, 90, 120,] //125, 130, 133, 136, 138, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170]

  // digibellPatternStartTimes.forEach(patternStartTime => {
  //   const randomPattern = createRandomPattern(digibellPitches, digibellTimeValues)
  //   Tone.Draw.schedule(() => {
  //     console.log('pattern:', randomPattern)
  //     console.log('pattern started at', patternStartTime)
  //   }, patternStartTime + 1)
  //   Tone.Transport.scheduleRepeat((time) => {
  //     randomPattern.forEach(note => {
  //       digibell.triggerAttack(note.pitch, Tone.Transport.toSeconds(note.startTime) + time)
  //     })
  //   }, patternDuration(randomPattern), patternStartTime)
  // })

  //digibell.volume.rampTo(-Infinity, 140, 160)

  // Bass -------------------------------------------

  const bassNotes = shuffle(['E2', 'G2', 'C2', 'A1', 'B1'])
  
  Tone.Transport.scheduleRepeat((time) => {
    bassSynth.triggerAttackRelease(bassNotes[0], '1m')
    bassSynth.triggerAttackRelease(bassNotes[1], '1m', time + Tone.Transport.toSeconds('1m'))
    bassSynth.triggerAttackRelease(bassNotes[2], '1m', time + Tone.Transport.toSeconds('2m'))
    bassSynth.triggerAttackRelease(bassNotes[3], '1m', time + Tone.Transport.toSeconds('3m'))
    bassSynth.triggerAttackRelease(bassNotes[0], '1m', time + Tone.Transport.toSeconds('4m'))
    bassSynth.triggerAttackRelease(bassNotes[1], '1m', time + Tone.Transport.toSeconds('5m'))
    bassSynth.triggerAttackRelease(bassNotes[2], '1m', time + Tone.Transport.toSeconds('6m'))
    bassSynth.triggerAttackRelease(bassNotes[4], '1m', time + Tone.Transport.toSeconds('7m'))
  }, '8m', '8m')

  bassVolume.mute = true
  Tone.Transport.schedule(time => {bassVolume.mute = false}, '8m')

  // Drums ------------------------------------------

  const kickPattern = constructDrumPattern(kickProbabilities)
  const variedKickPattern = varyDrumPattern(kickPattern, kickProbabilities, 0.5)

  const snarePattern = constructDrumPattern(snareProbabilities)
  const variedSnarePattern = varyDrumPattern(snarePattern, snareProbabilities, 0.5)

  const hihatOpenPattern = constructDrumPattern(hihatOpenProbabilities)
  const variedHihatOpenPattern = varyDrumPattern(hihatOpenPattern, hihatOpenProbabilities, 0.5)
  
  const hihatClosedPattern = removeOverlappingBeats(constructDrumPattern(hihatClosedProbabilities), hihatOpenPattern)
  const variedHihatClosedPattern = removeOverlappingBeats(varyDrumPattern(hihatClosedPattern, hihatClosedProbabilities, 0.5), variedHihatOpenPattern)
  
  Tone.Transport.scheduleRepeat(time => {
    playDrumPattern(kickPattern, time, 'C2', drumSampler)

    if (time > Tone.Time('32m')) {
      playDrumPattern(snarePattern, time, 'D2', drumSampler)
    }

    if (time > Tone.Time('24m')) {
      playDrumPattern(hihatOpenPattern, time, 'A#2', drumSampler)
      playDrumPattern(hihatClosedPattern, time, 'F#2', drumSampler, hihatOpenPattern)
    }
  }, Tone.Time(kickProbabilities.duration) * 2, '16m')

  Tone.Transport.scheduleRepeat(time => {
    playDrumPattern(variedKickPattern, time, 'C2', drumSampler)

    if (time > Tone.Time('40m')) {
      playDrumPattern(variedSnarePattern, time, 'D2', drumSampler)
    }
    
    if (time > Tone.Time('24m')) {
      playDrumPattern(variedHihatOpenPattern, time, 'A#2', drumSampler)
      playDrumPattern(variedHihatClosedPattern, time, 'F#2', drumSampler, hihatOpenPattern)
    } 
  }, Tone.Time(kickProbabilities.duration) * 2, Tone.Time(kickProbabilities.duration) + Tone.Time('16m'))

  // Melody -----------------------------------------

  const partStartMeasures = {
    'A1': '0m',
    'B1': '8m',
    'A2': '40m',
    'B2': '56m',
    'C' : '64m',
  }

  const melodyA = []
  melodyA[0] = createRandomMelody(melodyPitches, melodyTimeValues)
  melodyA[1] = createRandomMelody(melodyPitches, melodyTimeValues)
  melodyA[2] = createRandomMelody(melodyPitches, melodyTimeValues)

  const melodyB = []
  melodyB[0] = createRandomMelody(melodyPitches, melodyTimeValues)
  melodyB[1] = createRandomMelody(melodyPitches, melodyTimeValues)
  melodyB[2] = createRandomMelody(melodyPitches, melodyTimeValues)

  // playABACMelody(melodyA, '0m', '4m')
  // playABACMelody(melodyA, '8m',  '12m')
  // playABACMelody(melodyA, '16m', '20m')

  const concatenatedMelodyA = concatenateToABACMelody(melodyA)
  console.log("created melody:")
  console.log(concatenatedMelodyA)

  Tone.Transport.scheduleRepeat((time) => {
    concatenatedMelodyA.forEach(note => {
      melody.triggerAttack(note.pitch, Tone.Transport.toSeconds(note.startTime) + time)
    })
  }, '16m', '0m')
  Tone.Transport.scheduleRepeat((time) => {
    concatenatedMelodyA.forEach(note => {
      melody.triggerAttack(note.pitch, Tone.Transport.toSeconds(note.startTime) + time)
    })
  }, '16m', '4m')
  
  const generatedMelody = await generateMagentaMelody(concatenatedMelodyA, 10)
  console.log('magenta melody:')
  console.log(generatedMelody)

  Tone.Transport.scheduleRepeat((time) => {
    generatedMelody.forEach(note => {
      melody.triggerAttack(note.pitch, Tone.Transport.toSeconds(note.startTime) + time)
    })
  }, '16m', '8m')
  
  Tone.Transport.scheduleRepeat((time) => {
    generatedMelody.forEach(note => {
      melody.triggerAttack(note.pitch, Tone.Transport.toSeconds(note.startTime) + time)
    })
  }, '16m', '12m')

  
  // playABACMelody(melodyB, partStartMeasures['B1'], partStartMeasures['A2'])
  // playABACMelody(melodyA, partStartMeasures['A2'], partStartMeasures['B2'])
  // playABACMelody(melodyB, partStartMeasures['B2'], partStartMeasures['C'])

  // playABACMelody(melodyA, partStartMeasures['C'], '96m')
  // playABACMelody(melodyB, partStartMeasures['C'], '96m')


  // Cosmetics --------------------------------------

  const root = document.getElementById('root')

  setInterval(() => {
    const melodyVolume = melodyMeter.getValue()
    const red = melodyVolume > -70 ? melodyVolume + 70 : 10
    
    const drumVolume = drumMeter.getValue()
    const green = drumVolume > -50 ? drumVolume + 50 : 10

    const bassVolume = bassSynthMeter.getValue()
    const blue = bassVolume > -50 ? bassVolume + 50 : 10
 
    root.style.background = `radial-gradient(circle, rgb(${red},${green},${blue}) 0%, rgb(10,10,10) 100%)`
  }, 100)

  Tone.Transport.start()
}

const stop = () => {
  togglePlayStopVisibilities()
  toggleMute()
  Tone.Transport.stop()
  Tone.Transport.cancel()
  melody.releaseAll()
  //bassSynth.releaseAll()
  drumSampler.releaseAll()
  rev.decay = 0.5
  recorder.stop()
}

const openModal = () => {
  const modal = document.getElementById('downloadModal')
  modal.classList.add('active')
}

const closeModal = () => {
  const modal = document.getElementById('downloadModal')
  modal.classList.remove('active')
  const audioPlayer = document.getElementById('audioPlayer')
  audioPlayer.pause()
}

document.getElementById('playButton').addEventListener('click', async () => {
  play()
  closeModal()
})

document.getElementById('stopButton').addEventListener('click', async () => {
  stop()
  openModal()
})

document.getElementById('closeButton').addEventListener('click', async () => {
  closeModal()
})