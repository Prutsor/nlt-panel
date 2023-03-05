# NLT Panel (2.2.1)

![header.png](/instructions/header.png '2.2.1')

### Benodigdheden

- Materialen
  - 1,2 kg doorzichtig filament, verkrijgbaar via deze [link](https://www.prusa3d.com/product/clear-pla-filament-1kg/)
  - MDF plaat van 25x70 cm
  - LED-voeding van 5V (minimaal 6A)
  - LED-strip van 5m (30LED/m)
  - Arduino Uno
  - DS1307 RTC-module
- Gereedschappen
  - Lasersnijmachine
  - 3D printer (Prusa)

### Installeren

1. Installeer de repository (`git clone https://github.com/Prutsor/nlt-panel`)
2. Installeer de dependencies (`npm install`)
3. Start het programma
   - Simulatie: `npm run tools.sim`
   - SVG: `npm run tools.svg`

### Bestanden

- [Print Hexagons v6.stl](https://github.com/Prutsor/nlt-panel/raw/main/files/Print%20Hexagons%20v6.stl)
- [20230305124813.svg](https://github.com/Prutsor/nlt-panel/raw/main/files/20230305124813.svg)
- [Print Caps v9.stl](https://github.com/Prutsor/nlt-panel/raw/main/files/Print%20Caps%20v9.stl)
- [nlt-panel.ino](https://github.com/Prutsor/nlt-panel/blob/main/nlt-panel.ino)

### Stappenplan

##### 1. Hexagons printen

Om het project te starten moeten eerst de hexagons geprint worden. Hierbij wordt ongeveer 1,2 kg filament gebruikt en het zal ongeveer vijf dagen duren. Aangezien er zoveel hexagons geprint moeten worden, is het nodig om het proces op te splitsen. Daarom heb ik een [bestand](https://github.com/Prutsor/nlt-panel/raw/main/files/Print%20Hexagons%20v6.stl) gemaakt met 28 hexagons, die vijf keer geprint moeten worden. Terwijl de hexagons aan het printen zijn, kun je alvast verder met de volgende stappen.

##### 2. Plaat snijden

De volgende stap in het project is het lasersnijden van de houten plaat. Om het [bestand](https://github.com/Prutsor/nlt-panel/raw/main/files/20230305124813.svg) te maken, heb ik het SVG programma gebruikt (`npm run tools.svg`). Het programma zorgt voor een mooie rand rondom de plaat. **Let op:** prik nog geen hexagons in de plaat na het snijden, want de LED-strip moet nog worden opgeplakt. Hieronder is het bestand te zien, waarbij de rode lijnen de gaten voor de hexagons aangeven en de blauwe lijnen de rand van de plaat aangeven.

![20230305124813.svg](/files/20230305124813.svg 'Bestand voor het snijden van de plaat')

##### 3. LED-strip bevestigen

Om de LED-strips op de plaat te bevestigen, moet je de strip in vijf delen knippen: 2x17, 2x18, 2x19 en 1x20 LED's. Het is belangrijk om ze op de juiste manier op de plaat te plaatsen om ervoor te zorgen dat ze goed werken. Hieronder vind je de juiste richtingen voor het plaatsen van de LED-strips op de plaat.

![led-richting.png](/instructions/led-richting.png 'Richting van de LED-strips')

Je moet de LED-strips aan elkaar solderen zoals aangegeven in de onderstaande afbeelding. Het is belangrijk om ervoor te zorgen dat de polariteit van de LED-strips correct is aangesloten om schade aan de strips te voorkomen.

![led-solderen.png](/instructions/led-solderen.png 'Solderen van de LED-strips')

<details>
  <summary>Testen van de LED-strips</summary>

Na het solderen van alle delen is het aan te raden om te controleren of de LED's correct werken voordat we doorgaan met het bevestigen van de hexagons. Om dit te doen, kun je de [strandtest](https://github.com/adafruit/Adafruit_NeoPixel/blob/master/examples/strandtest/strandtest.ino) van NeoPixel uploaden naar de Arduino en de LED-strips tijdelijk aansluiten op de Arduino. Het is belangrijk om de helderheid laag te houden, aangezien de Arduino een lage stroomsterkte heeft.

</details>

##### 4. Hexagons plaatsen

Na het solderen (en eventueel testen) van de LED-strips is het tijd om de hexagons te plaatsen. Om schade aan de LED-strips te voorkomen, is het essentieel om voorzichtig te werk te gaan. Soms kan het lastig zijn om de hexagons op hun plaats te krijgen, in dat geval kan het helpen om de gaten iets groter te maken met schuurpapier.

##### 5. Voeding aansluiten

##### 6. Arduino en RTC aansluiten

##### 7. Instellen

Je moet eerst de [code](https://github.com/Prutsor/nlt-panel/blob/main/nlt-panel.ino) naar de Arduino uploaden voordat je de klok kunt instellen. Nadat de code succesvol is geüpload, open je het instelprogramma met het commando `npm run tools.sim`. Klik op de `Connect` knop rechtsboven in het programma om een Arduino te kiezen om mee te verbinden.

![instellen-1.PNG](/instructions/instellen-1.PNG 'Klik op de `Connect` knop')

Na het klikken op de `Connect` knop verschijnt er een menu waarin je de Arduino moet selecteren. Meestal kan het programma de Arduino automatisch detecteren en wordt de beschikbare poort aangegeven door de blauwe lijn naast de poort. Selecteer vervolgens de Arduino.

![instellen-2.PNG](/instructions/instellen-2.PNG 'Selecteer de Arduino')

Nadat je de Arduino hebt geselecteerd, kun je de verbinding controleren aan de blauwe lijn onder de `Connect` knop. Om te zien wat er op de klok zou moeten staan, klik je op de `Debug` knop. Om het instellen af te ronden, klik je op de `Set` knop bij de tijd in de configuratie. Hierdoor wordt de tijd van de gebruikte computer naar de klok gestuurd en blijft deze doortellen, zelfs als de klok uit staat. Zo hoef je nooit meer de tijd in te stellen.

![instellen-2.PNG](/instructions/instellen-3.PNG 'Tijd instellen')

##### 8. Bijwerken

Om de klok bij te werken, volg je deze stappen:

1. Voer het commando `git pull` uit om de meest recente versie van de code te downloaden.
2. Upload de [bijgewerkte code](https://github.com/Prutsor/nlt-panel/blob/main/nlt-panel.ino) naar de Arduino.
3. Stel de klok eventueel opnieuw in.

<details>
  <summary>Hoe weet ik of de klok up-to-date is?</summary>
  
  1. Voer het commando `git pull` uit om de meest recente versie van de code te downloaden.
  2. Voer `npm run tools.sim` uit.
  3. Klik op `Connect`
  4. Selecteer de Arduino
  5. Vergelijk de versies zoals in de onderstaande afbeelding:
    ![updaten-1.PNG](/instructions/updaten-1.PNG 'Versies vergelijken')
</details>
