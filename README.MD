# YUGIOH-CARDS-UPSCALED
Simple hacked together repository for storing and serving yugioh cards that have been upscaled.
Main purpose is for the use in EDOPro

Original images are gathered from ygoprodeck.com and upscaled with various methods (currently real-esrgan)

# How do I use this in EDO-PRO?
Navigate to your Edo-Pro install folder and open the file `ProjectIgnis\config\config.json`
in the config you want to add/replace the following
```json
"urls": [
	{
		"url": "https://raw.githubusercontent.com/TheBv/Yugioh-Cards/master/esrgan-2x/{}.jpg",
		"type": "pic"
	},
	{
		"url": "https://images.ygoprodeck.com/images/cards/{}.jpg",
		"type": "pic"
	},
	{
		"url": "default",
		"type": "pic"
	},
	...
],
```
This will try to download the upscaled card(s) first, then if that fails try to download them from ygoprodeck and finally trying the default, low res images.

The same can also be done for fields. Take a look at the `config-example.json` file for a complete list.

# Requirements
This project uses bun and was run on WSL.
To fetch images run fetch.ts
To upscale them use the executables provided in `./realesrgan`