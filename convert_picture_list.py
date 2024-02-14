#file_path = input("File path of picture list: ") # ./public/out-files/MNAC-AbsidiolaSud/MNAC-AbsisSud-NomesFotos-llistaImatges.lst
#destination_path = input("File of destination: ") # ./public/out-files/MNAC-AbsidiolaSud/MNAC-AbsisSud-NomesFotos-llistaImatges_converted.lst
#f = open(file_path)
#f2 = open(destination_path)
f = open("./public/out-files/MNAC-AbsidiolaSud/MNAC-AbsisSud-NomesFotos-llistaImatges.lst", "r")
f2 = open("./public/out-files/MNAC-AbsidiolaSud/MNAC-AbsisSud-NomesFotos-llistaImatges_converted-converted.lst", "w")
content = f.read()
lines = content.split('\n')

for line in lines:
    words = line.split('\\')
    f2.write(words[len(words) - 3] + '/' + words[len(words) - 2] + '/' + words[len(words) - 1] + '\n')