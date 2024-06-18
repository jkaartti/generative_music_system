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
  downloadLink.download = `generated_song_${new Date().toISOString()}.wav`
  audioChuncks.length = 0 // Empty the array for next use
}

// Magenta stuff
const TEMPERATURE = 0.1
const RNN_CHECKPOINT = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn'
const musicRnn = new mm.MusicRNN(RNN_CHECKPOINT)

// MASTER ------------
const master = new Tone.Volume().toDestination()
master.connect(dest)
// -------------------

// BASS --------------
const bassVolume = new Tone.Volume().connect(master) // For muting
const bassSynth = new Tone.Synth().connect(bassVolume)
bassSynth.volume.value = -3

const bassSynthMeter = new Tone.Meter()
bassSynth.connect(bassSynthMeter)
// -------------------

// DIGIBELL ----------
// const digibell = new Tone.Sampler({
//   urls: {
//     'A2': 'Digibell_A2.mp3',
//     'B2': 'Digibell_B2.mp3',
//     'D3': 'Digibell_D3.mp3',
//     'E3': 'Digibell_E3.mp3',
//     'G3': 'Digibell_G3.mp3',
//     'A3': 'Digibell_A3.mp3',
//     'B3': 'Digibell_B3.mp3',
//     'D4': 'Digibell_D4.mp3',
//     'E4': 'Digibell_E4.mp3',
//     'G4': 'Digibell_G4.mp3',
//     'A4': 'Digibell_A4.mp3',
//     'B4': 'Digibell_B4.mp3',
//     'D5': 'Digibell_D5.mp3',
//     'E5': 'Digibell_E5.mp3',
//     'G5': 'Digibell_G5.mp3',
//   },
//   release: 1,
// 	baseUrl: './Digibell/',
// })
// digibell.volume.value = -18

// const digibellMeter = new Tone.Meter()
// digibell.connect(digibellMeter)

// const digibellCompressor = new Tone.Compressor(-24, 6).connect(master)
// digibell.connect(digibellCompressor)
// -------------------

// MELODY ------------
const melodySynth = new Tone.Sampler({
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
melodySynth.volume.value = -18

const melodyMeter = new Tone.Meter()
melodySynth.connect(melodyMeter)

const melodyCompressor = new Tone.Compressor(-24, 6).connect(master)
melodySynth.connect(melodyCompressor)
// -------------------

// DRUMS -------------
const drumSampler = new Tone.Sampler({
  urls: {
    'C2' : 'kick.wav',
    'D2' : 'snare.wav',
    'F#2': 'hihatClosed.wav',
    'A#2': 'hihatOpen.wav',
    'C#2': 'crash.wav',
    'A2' : 'reverse_crash.wav',
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
// digibell.connect(rev)
melodySynth.connect(rev)
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

  return concatenatedMelody
}

const scheduleMelody = (melody, startTime, endTime) => {    
  const duration = Tone.Time(endTime) - Tone.Time(startTime)

  Tone.Transport.scheduleRepeat((time) => {
    melody.forEach(note => {
      melodySynth.triggerAttack(note.pitch, Tone.Transport.toSeconds(note.startTime) + time)
    })
  }, Tone.Time('1m') * 4, startTime, duration)
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

  await Tone.start()

  // Structure --------------------------------------

  const partStartMeasures = {
    'A1' : '0m',  // original
    'B1' : '16m', // original
    'A2' : '32m', // original
    'B2' : '40m', // original
    'A3' : '48m', // magenta
    'B3' : '56m', // magenta
    'A4' : '64m', // magenta
    'B4' : '68m', // magenta
    'A5' : '72m', // original
    'END': '76m',
  }

  const crashHits = ['A2', 'A3', 'A5'].map(key => partStartMeasures[key])

    // Melody -----------------------------------------

  const melodyA = []
  melodyA[0] = createRandomMelody(melodyPitches, melodyTimeValues)
  melodyA[1] = createRandomMelody(melodyPitches, melodyTimeValues)
  melodyA[2] = createRandomMelody(melodyPitches, melodyTimeValues)

  const melodyB = []
  melodyB[0] = createRandomMelody(melodyPitches, melodyTimeValues)
  melodyB[1] = createRandomMelody(melodyPitches, melodyTimeValues)
  melodyB[2] = createRandomMelody(melodyPitches, melodyTimeValues)

  const concatenatedMelodyA = concatenateToABACMelody(melodyA)
  const concatenatedMelodyB = concatenateToABACMelody(melodyB)
  
  const generatedMelodyA = await generateMagentaMelody(concatenatedMelodyA, 10)
  const generatedMelodyB = await generateMagentaMelody(concatenatedMelodyB, 10)

  scheduleMelody(concatenatedMelodyA, partStartMeasures['A1'], partStartMeasures['B1'] )
  scheduleMelody(concatenatedMelodyB, partStartMeasures['B1'], partStartMeasures['A2'] )
  scheduleMelody(concatenatedMelodyA, partStartMeasures['A2'], partStartMeasures['B2'] )
  scheduleMelody(concatenatedMelodyB, partStartMeasures['B2'], partStartMeasures['A3'] )
  scheduleMelody(generatedMelodyA,    partStartMeasures['A3'], partStartMeasures['B3'] )
  scheduleMelody(generatedMelodyB,    partStartMeasures['B3'], partStartMeasures['A4'] )
  scheduleMelody(generatedMelodyA,    partStartMeasures['A4'], partStartMeasures['B4'] )
  scheduleMelody(generatedMelodyB,    partStartMeasures['B4'], partStartMeasures['A5'] )
  scheduleMelody(concatenatedMelodyA, partStartMeasures['A5'], partStartMeasures['END'])

  // Bass -------------------------------------------

  const bassNotes = shuffle(['E2', 'G2', 'C2', 'A1', 'B1'])
  const bassStartTime = Tone.Time('8m').toSeconds()
  const bassDuration = Tone.Time(partStartMeasures['A5']).toSeconds() - bassStartTime
  
  Tone.Transport.scheduleRepeat((time) => {
    bassSynth.triggerAttackRelease(bassNotes[0], '1m')
    bassSynth.triggerAttackRelease(bassNotes[1], '1m', time + Tone.Transport.toSeconds('1m'))
    bassSynth.triggerAttackRelease(bassNotes[2], '1m', time + Tone.Transport.toSeconds('2m'))
    bassSynth.triggerAttackRelease(bassNotes[3], '1m', time + Tone.Transport.toSeconds('3m'))
    bassSynth.triggerAttackRelease(bassNotes[0], '1m', time + Tone.Transport.toSeconds('4m'))
    bassSynth.triggerAttackRelease(bassNotes[1], '1m', time + Tone.Transport.toSeconds('5m'))
    bassSynth.triggerAttackRelease(bassNotes[2], '1m', time + Tone.Transport.toSeconds('6m'))
    bassSynth.triggerAttackRelease(bassNotes[4], '1m', time + Tone.Transport.toSeconds('7m'))
  }, '8m', bassStartTime, bassDuration)

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
  }, Tone.Time(kickProbabilities.duration) * 2, '16m', '48m')

  Tone.Transport.scheduleRepeat(time => {
    playDrumPattern(variedKickPattern, time, 'C2', drumSampler)

    if (time > Tone.Time('40m')) {
      playDrumPattern(variedSnarePattern, time, 'D2', drumSampler)
    }
    
    if (time > Tone.Time('24m')) {
      playDrumPattern(variedHihatOpenPattern, time, 'A#2', drumSampler)
      playDrumPattern(variedHihatClosedPattern, time, 'F#2', drumSampler, hihatOpenPattern)
    } 
  }, Tone.Time(kickProbabilities.duration) * 2, Tone.Time(kickProbabilities.duration) + Tone.Time('16m'), '56m')

  crashHits.forEach(hitMeasure => {
    Tone.Transport.schedule(time => {
      drumSampler.triggerAttack('C#2', time, 0.3)
    }, hitMeasure)
    Tone.Transport.schedule(time => {
      drumSampler.triggerAttack('A2', time, 0.3)
    }, Tone.Time(hitMeasure).toSeconds() - Tone.Time('2m').toSeconds())
  })

  // Cosmetics --------------------------------------

  const root = document.getElementById('root')

  setInterval(() => {
    const melodyVolume = melodyMeter.getValue()
    const red = melodyVolume > -100 ? melodyVolume + 100 : 10
    
    const drumVolume = drumMeter.getValue()
    const green = drumVolume > -50 ? drumVolume + 60 : 10

    const bassVolume = bassSynthMeter.getValue()
    const blue = bassVolume > -50 ? bassVolume + 60 : 10
 
    root.style.background = master.mute ? 'rgb(10,10,10)' : `radial-gradient(circle, rgb(${red},${green},${blue}) 0%, rgb(10,10,10) 100%)`
  }, 100)

  Tone.Transport.schedule(time => {
    stop()
  }, Tone.Time(partStartMeasures['END']).toSeconds() + rev.decay)

  Tone.Transport.start()
}

const stop = () => {
  toggleMute()
  Tone.Transport.stop()
  Tone.Transport.cancel()
  melodySynth.releaseAll()
  drumSampler.releaseAll()
  rev.decay = 0.5
  recorder.stop()
  togglePlayStopVisibilities()
  openModal()
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
})

document.getElementById('closeButton').addEventListener('click', async () => {
  closeModal()
})