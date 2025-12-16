import sounddevice as sd
from scipy.io.wavfile import write

fs = 44100  # Sample rate
seconds = int(input("Enter the time duration in seconds: "))

print("Recording...\n")

record_voice = sd.rec(
    int(seconds * fs),
    samplerate=fs,
    channels=2,
    dtype='int16'
)

sd.wait()  # Wait until recording is finished

write("out.wav", fs, record_voice)

print("Finished...\nPlease check 'out.wav'.")
