#file_path = input("File path of picture list: ") # ./public/out-files/MNAC-AbsidiolaSud/MNAC-AbsisSud-NomesFotos-llistaImatges.lst
#destination_path = input("File of destination: ") # ./public/out-files/MNAC-AbsidiolaSud/MNAC-AbsisSud-NomesFotos-llistaImatges_converted.lst
#f = open(file_path)
#f2 = open(destination_path)
f = open("./public/out-files/MNAC-AbsidiolaSud/MNAC-AbsSud-CamerasList.lst", "r")
f2 = open("./public/out-files/MNAC-AbsidiolaSud/MNAC-AbsSud-CamerasList-converted.txt", "w")
content = f.read()
lines = content.split('\n')

for line in lines:
    words = line.split('\\')
    f2.write('/home/bernat/Pictures/SouthAbs/' + words[len(words) - 1] + '\n')