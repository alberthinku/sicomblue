# Web Bluetooth SiCom
web bluetooth connection tool
https://alberthinku.githut.io/

this tool amid on the web based bluetooth development task, provide Json file interface for customized profile selection. can scan, connect, acting on char seperately or simoutenously, and store the notificaiton data into local drive for offline analysis.

SiCom web bluetooth connection tool user environment:
HARDWARE: PC/Mac/Laptop/Chromebook, 
SOFTWARE: 
  Chrome ver70 or later on Windows10 or
  Chrome ver56 or later on Mac/Linux/Window7

Bluetooth devices : 
Hardware : BBC microbit, STM32 Nucelo kit, SensorTile, or any device equipted with BLE 4.x or later
Firmware/Profile : BBC microbit V1_11, ST BlueST V4.3 or later/FunctionPack ALLMEMS/FLV/MOTENV 

Known Limitations for current version:
1. the FP-SENSING1 (AI) can not be discovered and connected yet
2. long discover time for ST BlueST profile devices sometime took 20-30seconds
3. step.1 selectable profiles are not covering the whole original profile yet 
  step.1 selectable profile currently have :
  BBC microbit -- on 3 services 4 chars included,
  ST BlueST -- on 1 services upto 4 chars included,
  ST BlueST_f -- on 1 service upto 14 chars included,

if you have any questions or suggestions, please feel free to leave your comments or send an email to yahui.sun@gmail.com

note:
the current version (100919) is valid for BlueST (ST BlueST profile, on https://github.com/STMicroelectronics/BlueSTSDK_Android) and Microbit Bluetooth profile(lancaster university project https://lancaster-university.github.io/microbit-docs/ble/profile/) only. The Web Bluetooth SiCom tool inspired by MartinWoolley' JSmeetup video (http://bluetooth-mdw.blogspot.com/2018/12/amsterdamjs-meetup.html) and tested demos included BBC Microbit V1.5 (or later) and STMicroelectronics Nucleo kits and SensorTile (on almost all the FP-ALLMEMs/FLV/MOTENV1 except FP-SENSING1(i.e. AI package) due to some discovery issue pending).

110919
<end>
