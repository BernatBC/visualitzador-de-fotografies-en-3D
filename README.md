# Readme

## Getting Started (South Apse with full model)

### 1. Create directory structure
You'll need to create a `public` directory in the root of the project. This folder will contain the images, models and data files. The structure of this directory needs to be the following:

- public
    - images
        - low_res
        - Sant Quirze de Pedret by Zones
    - models
        - pedret
    - out-files
        - MNAC-AbsidiolaSud

### 2. Add full resolution pictures
Now, add the pictures inside `public/images/Sant Quirze de Pedret by Zones`. Inside `MNAC - South Apse` you'll find a directory called `Pictoric details and architecture`. Please place those pictures into `public/images/Sant Quirze de Pedret by Zones/MNAC - South Apse`.

### 3. Create low resolution pictures
Copy your `public/images/Sant Quirze de Pedret by Zones` into `public/images/low_res/Sant Quirze de Pedret by Zones`. Then copy `reducesize.sh` inside `public/images/low_res/Sant Quirze de Pedret by Zones/MNAC - South Apse` and run the script.

```bash
chmod +x reducesize.sh # Give execution permissions
./reducesize.sh # Run the script
```

*IMPORTANT:* This script will override the pictures, so make sure you are running the script against the files located into *low_res* directory.

### 4. Create dzi pictures
Now, install [deepzoom.py](https://github.com/openzoom/deepzoom.py) following the repo guide. After the installation is completed, please, copy `image-to-dzi.py` and `makeDZI.sh` files inside `public/images/Sant Quirze de Pedret by Zones`. Now, run `makeDZI.sh`.

```bash
chmod +x makeDZI.sh # Give execution permissions
./makeDZI.sh # Run the script
```

### 5. Place your model
Now, add your model `pedret_XII_text4K.glb` into `public/models/pedret`. In the case you have a different one, you'll need to change the model name inside `main.js`.

### 6. Place your Bundler files
Now, place your `MNAC-AbsSud-CamerasRegistration.out` inside `public/out-files/MNAC-AbsidiolaSud`. Then modify the paths of your `MNAC-AbsSud-CamerasList.lst`. To do so execute `convert_picture_list.py`. Before running it, modify the paths inside `convert_picture_list.py` to fit your needs. Place the outputted file into `public/out-files/MNAC-AbsidiolaSud`.

```bash
python3 convert_picture_list.py # Run the script
```

### Proper structure
Your `public` directory should be similar to:

- public
    - images
        - low_res
            - Sant Quirze de Pedret by Zones
                - MNAC - South Apse
                    - *.jpg (10% resolution)
        - Sant Quirze de Pedret by Zones
            - MNAC - South Apse
                - *.jpg
                - *.dzi
    - models
        - pedret
            - pedret_XII_text4K.glb
    - out-files
        - MNAC-AbsidiolaSud
            - MNAC-AbsSud-CamerasRegistration.out
            - MNAC-AbsSud-CamerasList-converted.lst

### 7. Install dependencies
Install node dependencies. Run the following command in the root of the project.

```bash
npm install
```

### 8. Run the application
Finally you'll need to start your server, running:

```bash
npx vite
```

Once it's loaded, you can open your browser and navigate to `http://localhost:5173/`. Your URL might be different, so pay attention to the `npx vite` output.

### 9. Build the application
You can generate the static site by using the following commands, or by running `buildSite.sh`.

```bash
npx vite build
cp openseadragon.html dist/
cp openseadragon.css dist/
cp openseadragon.js dist/
cp -r openseadragon dist/
```

The `dist` directory will contain all the files needed.
You can preview the site by entering `npx vite preview`, and you can deploy it to your favourite platform.