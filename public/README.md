<h1> # Web Bluetooth SiCom </h1>
<h2>web bluetooth connection tool</h2>
<p>author: Albert Sun </p>
<p>projects >> <a href=https://alberthinku.githut.io> (V1.0.0) </a>, <a href=https://sicomblue.herokuapp.com> (V1.0.1 and later version)</a> under<a href=license> GPL-3 lisense</a></p>


<p>this tool amid on the web based bluetooth development task, provide Json file interface for customized profile selection. can scan, connect, acting on char seperately or simoutenously, and store the notificaiton data into local drive for offline analysis.</p>

<h3>SiCom web bluetooth connection tool user environment:</h3>
<p>HARDWARE: 
<p>PC/Mac/Laptop/Chromebook</p>
<p>SOFTWARE: </p>
  <p>Chrome ver70 or later on Windows10 or</p>
  <p>Chrome ver56 or later on Mac/Linux/Window7</p>
  <p>Edge on Window10 or later </p>

<h3>Bluetooth devices : </h3>
<p>Hardware : BBC microbit, STM32 Nucelo kit, SensorTile, or any device equipted with BLE 4.x or later<p>
<p>Firmware/Profile : BBC microbit V1_11, ST BlueST V4.3 or later/FunctionPack ALLMEMS/FLV/MOTENV </p>

<h3>Known Limitations for current version:</h3>
<p>1. the FP-SENSING1 (AI) can not be discovered and connected yet</p>
<p>2. long discover time for ST BlueST profile devices sometime took 20-30seconds</p>
<p>3. step.1 selectable profiles are not covering the whole original profile yet </p>
<p>  step.1 selectable profile currently have :
<p>   BBC microbit -- on 3 services 4 chars included,
<p>  ST BlueST -- on 1 services upto 4 chars included,
<p>  ST BlueST_f -- on 1 service upto 14 chars included,
<p>  ST Bluenrg -- on 3 services 6 chars included,

<p>if you have any questions or suggestions, please feel free to leave your comments or send an email to yahui.sun@gmail.com</p>

<h3>release notes:</h3>

<p>[0900822] version 1.2.2 -tof is on with new features & bugs:</p>
<p>1. fixed the tof 3D-2D modeling</p>

<p>[0600822] version 1.2.1 -tof(beta) is on with new features & bugs:</p>
<p>1. beta version focused on SFC first, looptof(9Aixs) is commented</p>
<p>2. latest Egde tested ok for webbluetooth connections</p>
<p>3. fine tuning scaleModel to draw the ball with tof</p>

<p>[051119] version 1.2.1 -tof is on with new features & bugs:</p>
<p>1. added 9axis fusion result as the input for tofmodeling</p>
<p>2. refined the fmodeling algorithm</p>
<p>3. due to the tof board working condition, the pitch of roll of the tof board output is not well monitored, may go back to review the fusion result for both 9axis and sfc output -- see note 4</p>
<p>4. the issue regarding the pitch and roll mistakes for fusion result of tof board, is showing as for sfc, initial change is huge(slight movement caused the cube rotation dramatically) or as for Mahony/Madgwick 9axis, the big change is causing little movement of cube rotation. reason may linked to the fusion parameters setting. tobe further investigated.</p>
<p>5. one of the big challenges are the calculation power for the pc during each interruption when notification comes, there are hunderes points to be calculated with fmodel and then rotation, which likely created huge defect to the fusion algorithm itself, so future development should be focused on rebalaned caculation power and improving the interrupt service efficiency</p>



<p>[281019] version 1.2.0 -tof is on with new features & bugs:</p>
<p>1. added tof page</p>
<p>2. represent tof scanning chart for given obj through two nodes, one for tof notif, one for obj sfc</p>

<p>[251019] version 1.1.12 -cubearms is on with new features & bugs:</p>
<p>1. added MadgwickAHRS algorithm by adding MadgwichAHRS class</p>
<p>2. tune the cube/arms display ui </p>
<p>3. reshuffled the filters functions</p>

<p>[241019] version 1.1.11 -cubearms is on with new features & bugs:</p>
<p>1. added on arms page a auto justify if single node input then drawarm, if multinode then drawarms, and cube will be aligned with multinode input as a combined rotation as well</p>
<p>2. crazepony algorithm is Mahony filter, Ki could be 0, and the Ki i.e. integral of the A+M will make Yaw drift </p>

<p>[211019] version 1.1.10 -cubearms is on with new features & bugs:</p>
<p>1. used absolute angle mapping to the fusion output so that improve the arms display accuracy, and avoided accumulating errors during the rotation obj displayed</p>

<p>[201019] version 1.1.9 -cubearms is on with new features & bugs:</p>
<p>1. used absolute angle mapping to the fusion output so that improve the cube/arm display accuracy, and avoided accumulating errors during the rotation obj displayed</p>

<p>[161019] version 1.1.8 -cubearms is on with new features & bugs:</p>
<p>1. added arms(2 phase) to arms page</p>
<p>2. able to trace 2 connected nodes with different movement</p>
<p>3. limit the arms nodes to 2 so far</p>

<p>[131019] version 1.1.6 -cube is on with new features & bugs:</p>
<p>1. added arm(1 phase) to the cube displace</p>
<p>2. fixed arm(1 phase) colorfill bug</p>
<p>3. realigned pRy from body to display</p>
<p>4. re-confirm the samples rate is 20-50hz instead of 166hz due to the nodes throughput ratio, while the filter need at >100hz, so currently we are using less samples to form the filter (samplerate= 166, cutoff= 30) inputs</p>

<p>[051019] version 1.1.5 -cube is on with new features & bugs:</p>
<p>1. dealt with cube non-cube node ui, and reset to reset cube as well</p>

<p>[031019] version 1.1.4 -cube is on with new features & bugs:</p>
<p>1. normalized the acc, gyro reading to match crazepony algorithm needs, now 9axis cube turn looks ok (mag[] == 0, otherwise it shifting a lot - investigate Mag[] ToDo)</p>
<p>2. reset button will clear the 3D canvas so that ui recovered</p>
<p>3. add one more canvas so that two cubes can be show same time if two Chars (SFC, 9Axis) notify</p>


<p>[021019] version 1.1.3 -cube is on with new features & bugs:</p>
<p>1. add drag and drop feature for char selection - for fusion cube</p>
<p>2. enabled 3D cube draw when perform cube action while only one cube can be draw today</p>


<p>[240919] version 1.1.2 is on with new features:</p>
<p>1. add one more profile example into profile example page</p>
<p>2. kick off the DnD feature preparation but yet to be released on version 1.1.3</p>

<p>[190919] version 1.1.1 is on with new features:</p>
<p>1. matching the service and char and regrouped them after discovery process</p>
<p>2. filter out the unavailable char or services when finished discovery process</p>
<p>3. improved ui, for lock and unlock to prevent unexpected input resulting crash</p>

<p>[180919] version 1.1.0 is on with new features:</p>
<p>1. enabled multi nodes (upto 3 right now) to be connected simutenously</p>
<p>2. improved ui so that multi nodes display and action much more easier</p>

<p>[170919] version 1.0.2 is on with new features:</p>
<p>1. user can use the write input box to process continuous write, Sicom tool will adapt to the long data and chunk them with appropriate GATT write action</p>
<p>2. another try to discover the TAI devices but failed on discoveryPrimaryServices with or w/o setTimeout, seems after the navigator.bluetooth.requestDevice() options services scan, the target device changed its services list</p>


<p>[150919] version 1.0.1 is on with new features:</p>
<p>1. user can choose 1 of the 4 default profiles or, they could upload their own profile to the server
<p>2. started node.js server node on heroku.com

<p>[110919] version 1.0.0 is on</p>
<p>the current version (100919) is valid for BlueST (ST BlueST profile, on https://github.com/STMicroelectronics/BlueSTSDK_Android) and Microbit Bluetooth profile(lancaster university project https://lancaster-university.github.io/microbit-docs/ble/profile/) only. 
<p>The Web Bluetooth SiCom tool inspired by MartinWoolley' JSmeetup video (http://bluetooth-mdw.blogspot.com/2018/12/amsterdamjs-meetup.html) and tested demos included BBC Microbit V1.5 (or later) and STMicroelectronics Nucleo kits and SensorTile (on almost all the FP-ALLMEMs/FLV/MOTENV1 except FP-SENSING1(i.e. AI package) due to some discovery issue pending).

<end>
