###
Copyright (c) 2012 Eric R. Johnson, http://www.lostbearlabs.com

All code on LostBearLabs.com is made available under the terms of the
Artistic License 2.0, for details please see:
   http://www.opensource.org/licenses/artistic-license-2.0.php
###

# (note: recompile in-place with 'coffee -cwo . .')

WIDTH = 400
HEIGHT = 400
_paper = null

_colors = ["red", "orange", "yellow", "green", "blue"]
_selected = []
_harm = [1, 3, 5, 7, 9]
NHARM = 5


_tunings = [
  {
    name: "equal temperament"
    names: [ "C", "D", "E", "F", "G", "A", "B", "C" ]
    notes: [523,587,659,699,784,880,988, 1047] # http://peabody.sapp.org/class/st2/lab/notehz/
    etnotes: [523,587,659,699,784,880,988, 1047] # same as notes
    midi: [0x3C, 0x3E, 0x40, 0x41, 0x43, 0x45, 0x47, 0x48]
  },
  {
    name: "just intonation"
    names: [ "C", "D", "E", "F", "G", "A", "B", "C" ]
    notes: [ 523*1/1, 523*9/8, 523*5/4, 523*4/3, 523*3/2, 523*5/3, 523*15/8, 523*2/1 ] # http://www.kylegann.com/tuning.html
    etnotes: [523,587,659,699,784,880,988, 1047]
    midi: [0x3C, 0x3E, 0x40, 0x41, 0x43, 0x45, 0x47, 0x48]
  },
  {
  name: "out of tune"
  names: [ "C", "D", "E", "F", "G", "A", "B", "C" ]
  etnotes: [523,587,659,699,784,880,988, 1047]
  notes: [523,587*1.01, 659*1.02, 699*0.99, 784*0.97, 880*1.03, 988*0.098, 1047*1.03]
  midi: [0x3C, 0x3E, 0x40, 0x41, 0x43, 0x45, 0x47, 0x48]
  }
]
_cur = _tunings[0]

height = (pitch) ->
  minPitch = _cur.notes[0]
  maxPitch = _cur.notes[ _cur.notes.length - 1]
  while( pitch<minPitch )
    pitch = pitch * 2
  while( pitch>maxPitch)
    pitch = pitch / 2

  logMax = Math.log(maxPitch)
  logMin = Math.log(minPitch)
  logPitch = Math.log(pitch)

  pct = (logPitch-logMin) / (logMax-logMin)
  num = _cur.names.length
  dy = HEIGHT/10
  y = dy + pct*num*dy
  HEIGHT - y

xpos = (note) ->
  dx = WIDTH / (_cur.names.length+2)
  (note+1) * dx

bar = (note, harm, pos) ->
  dx = WIDTH / (_cur.names.length+2)
  y = height( _cur.notes[note]*_harm[harm] )
  x0 = xpos(pos)
  x1 = x0 + 0.5*(xpos(pos+1)-x0)
  line = _paper.path "M #{x0},#{y} L #{x1},#{y}"
  line.attr "stroke", _colors[harm]
  line.attr "stroke-width", 3

draw = ->
  _paper.clear() if _paper

  # note lines
  for i in [0 ... _cur.names.length]
    dx = xpos(1) - xpos(0)
    x0 = xpos(0) - dx/2
    x1 = xpos(_cur.names.length) - dx/2
    y0 = y1 = height( _cur.notes[i] )
    line = _paper.path "M #{x0},#{y0} L #{x1},#{y1}"
    line.attr "stroke", "#888"

  # vertical labels
  for i in [0 ... _cur.names.length]
    x = dx/4
    y = height( _cur.notes[i] )
    _paper.text x, y, _cur.names[i]

  # horizontal labels
  for i in [0 ... _cur.names.length-1]
    _paper.text xpos(i)+10, HEIGHT-10, _cur.names[i]

  # harmonics
  for i in [0 ... _cur.names.length-1]
    for j in [0 ... NHARM]
      bar( i, j, i )

  # chord
  for i in [0 ... _cur.names.length-1]
    if _selected[i]
      for j in [0 ... NHARM]
        bar( i, j,  _cur.names.length )

  # hilite boxes
  for i in [0 ... _cur.names.length - 1]
    x0 = xpos(i)
    dx = 0.8 * (xpos(i+1) - x0)
    y0 = 0
    r = _paper.rect(x0, y0, dx, HEIGHT)
    r.attr "fill", "darkgrey"
    r.attr "opacity", (if _selected[i] then "0.2" else "0" )
    r.data "idx", i
    r.click( ->
      idx = this.data("idx")
      _selected[ idx ] = !_selected[idx]
      draw()
    )


onChangeTuning = ->
  selected = $("#selectTuning option:selected");
  val = selected.val();
  for t in _tunings
    if t.name == val
      _cur = t
  draw()

toNote = (i) ->
  {
    pitch: _cur.midi[i]
    frequency: _cur.notes[i]
    channel: i # play each note on its own channel, so that pitch bends will be note-by-note
  }


# EXPERIMENTAL (does not work) USE TUNING INSTEAD OF BEND
#  F0 7F <device ID> 08 02 tt ll [kk xx yy zz] F7
#
#  F0 7F	Universal Real Time SysEx header
#  <device ID>	ID of target device
#  08	sub-ID#1 (MIDI Tuning)
#  02	sub-ID#2 (note change)
#  tt	tuning program number (0 – 127)
#  ll	number of changes (1 change = 1 set of [kk xx yy zz])
#  [kk]	MIDI key number
#  [xx yy zz]	frequency data for that key (repeated ‘ll' number of times)
#  F7	EOX

## Frequency data shall be defined in units which are fractions of a semitone.
## The frequency range starts at MIDI note 0, C = 8.1758 Hz, and extends above
## MIDI note 127, G = 12543.875 Hz. The first byte of the frequency data word
## specifies the nearest equal-tempered semitone below the frequency. The next
## two bytes (14 bits) specify the fraction of 100 cents above the semitone
## at which the frequency lies. Effective resolution = 100 cents / 2^14 = .0061 cents.

## yy = MSB of fractional part (1/128 semitone = 100/128 cents = .78125 cent units)
## zz = LSB of fractional part (1/16384 semitone = 100/16384 cents = .0061 cent units)

#mkTuning = (note, freq) ->
#  cents = 1200 * Math.log(freq/8.1758) / Math.log(2)
#  nearestSemi = Math.floor(cents/100)
#  remain = cents - 100*nearestSemi
#  num = remain / 0.0061
#  hi = Math.floor(num/128)
#  lo = Math.floor(num % 128)
#
#  bytes = []
#  bytes.push 0xF0
#  bytes.push 0x7F
#  bytes.push 0x7F # device ID (7F = all devices)
#  bytes.push 0x08 # MIDI tuning
#  bytes.push 0x02 # note change
#  bytes.push 0x01 # tuning program number
#  bytes.push 0x01 # 1 change
#  bytes.push note # MIDI key number
#  xx = 0x44 #nearestSemi & 0xff
#  bytes.push xx
#  yy = 0x7F #hi & 0xff
#  bytes.push yy
#  zz = 0x7F #lo & 0xff
#  bytes.push zz
#  bytes.push 0xF7 # EOX
#  {
#    toBytes: -> bytes
#  }


computeBend = (note, base) ->
  cents = 1200 * Math.log( note / base ) / Math.log(2)
  bend = 8192 * (cents/200)
  # console.log( "bend:  #{note} / #{base} = #{cents} cents = #{bend} bend")
  8192 + bend


onClickPlay = ->

  duration = 128
  noteEvents = []

  # pause to intialize
  noteEvents.push(MidiEvent.noteOff( toNote(0), duration))

  # retune scale
  for i in [0 ... _cur.names.length]
    bend = computeBend( _cur.notes[i], _cur.etnotes[i] )
    noteEvents.push( MidiEvent.pitchBend( i, bend) )


  # play scale
  for i in [0 ... _cur.names.length]
    noteEvents.push MidiEvent.noteOn( toNote(i) )
    noteEvents.push(MidiEvent.noteOff( toNote(i), duration))

  # play selected notes (twice)
  for repeat in [0...2]
    for i in [0 ... _cur.names.length]
      if _selected[i]
        noteEvents.push MidiEvent.noteOn( toNote(i) )
        noteEvents.push(MidiEvent.noteOff( toNote(i), duration))

  # play chord
  for i in [0 ... _cur.names.length]
    if _selected[i]
      noteEvents.push MidiEvent.noteOn( toNote(i) )

  for i in [0 ... _cur.names.length]
    if _selected[i]
      noteEvents.push(MidiEvent.noteOff( toNote(i), 4*duration))


#  for note in ["C4", "E4", "G4"]
#    evts = MidiEvent.createNote(note)
#    for evt in evts
#      noteEvents.push evt

  track = new MidiTrack({ events: noteEvents })
  song  = MidiWriter({ tracks: [track] })
  $('#sound_').remove()
  embed = document.createElement("embed");
  embed.setAttribute("src", "data:audio/midi;base64," + song.b64);
  embed.setAttribute("type", "audio/midi");
  embed.setAttribute("id", "sound_")
  document.body.appendChild(embed);



$(document).ready ->
  for i in [0 ... _tunings.length]
    t = _tunings[i]
    $('#selectTuning').append('<option value="' + t.name + '">' + t.name + '</option>');
    $('#selectTuning').change(onChangeTuning)

  $('#play').click( onClickPlay )

  _paper = Raphael("TheCanvas", WIDTH, HEIGHT);
  draw()


