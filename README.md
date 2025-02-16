<div style="text-align: center;">
<h1><b>GPE Hub</b></h1>
<p><i>A toolbox by GPE Club for THIS students<br>Made by Will Li</i></p>
<img src="static/imgs/gpelogo.png" width="150">
</div>

 Downloads for Windows and MacOS are available at  [Release](https://github.com/BroWo1/GPE-Hub/releases)  

## !!! How to use (Macos)
 1. Download and install the software
 2. In terminal, enter the following code to enable MacOS to trust pieces of software from any developer
```commandline
sudo spctl --master-disable
```
 3. Go to System Preferences > Security & Privacy, click All apps downloaded from "Anywhere" 
 4. Enter the following code to clear the quarantine attribute of the software
```commandline
sudo xattr -r -d com.apple.quarantine /Applications/GPEHub.app
```
 5. Open the software and enjoy it!