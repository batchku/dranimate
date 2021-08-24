import * as THREE from 'three';
import React, { FC } from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';

import { ColorButton } from 'components/primitives/button-mui/button';
import CanvasSizePicker from 'components/primitives/canvas-size-picker/canvas-size-picker';

import { useAppDispatch, useAppSelector } from 'redux-util/hooks';
import { selectBackgroundColor, selectCanvasSize, selectFps, selectHandposeInputCamera, selectLivedrawInputCamera, setBackgroundColor, setFps, setHandposeInputCamera, setLivedrawInputCamera } from 'redux-util/reducers/project';
import { setCanvasSize } from 'redux-util/reducers/project';
import { useEffect } from 'react';
import { selectInputCameraList, setListOfAvailableInputCameras } from 'redux-util/reducers/ui';
import dranimate from 'services/dranimate/dranimate';

const availableCanvasSizes = [
  {x: 320, y: 320},
  {x: 480, y: 480},
  {x: 640, y: 640},
  {x: 800, y: 800},
  {x: 1024, y: 1024},
  {x: 1080, y: 1080},
  {x: 1280, y: 1280},
  {x: 1920, y: 1920},
];

const availableCanvasColors = [
  {name: 'Black', value: 0x000000},
  {name: 'Red', value: 0xff0000},
  {name: 'Green', value: 0x00ff00},
  {name: 'Blue', value: 0x0000ff},
  {name: 'White', value: 0xffffff}
];

interface ProjectPropertiesProps {
  open: boolean;
  onClose: () => void;
}

const ProjectProperties: FC<ProjectPropertiesProps> = (props) => {
  const canvasSize = useAppSelector(selectCanvasSize);
  const backgroundColor = useAppSelector(selectBackgroundColor);
  const fps = useAppSelector(selectFps);
  const inputCameraList = useAppSelector(selectInputCameraList);
  const livedrawInputCamera = useAppSelector(selectLivedrawInputCamera);
  const handposeInputCamera = useAppSelector(selectHandposeInputCamera);

  const dispatch = useAppDispatch();

  const onCanvasSizeChanged = (event: React.ChangeEvent<{
    value: string;
  }>): void => {
    if (event.target.value === 'Custom') {
      return;
    }

    const x = event.target.value.split('x')[0];
    const y = event.target.value.split('x')[1];

    dispatch(setCanvasSize({
      x: x,
      y: y,
    }));
  }

  const onCustomCanvasSizeChanged = (width: string, height: string): void => {
    dispatch(setCanvasSize({
      x: width,
      y: height,
    }));
  }

  const onBackgroundColorChanged = (event: React.ChangeEvent<{
    value: number;
  }>): void => {
    const selectedColorData = availableCanvasColors.find((color) => {
      return color.value === event.target.value;
    })

    dispatch(setBackgroundColor({
      name: selectedColorData.name,
      value: selectedColorData.value
    }));
  }

  const onLivedrawCameraChanged = (event: React.ChangeEvent<{
    value: string;
  }>): void => {
    dispatch(setLivedrawInputCamera(event.target.value));

    //////////////////
    const videoElement: HTMLVideoElement = document.getElementById(event.target.value) as HTMLVideoElement;

    const texture = new THREE.VideoTexture(videoElement);

    const geometry = new THREE.PlaneBufferGeometry(512, 512, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      map: texture
    });

    const cameraFeedPlane = new THREE.Mesh(geometry, material);

    for(let i = dranimate.liveFeedScene.children.length - 1; i >= 0; i--) { 
      const obj = dranimate.liveFeedScene.children[i];
      dranimate.liveFeedScene.remove(obj);
    }

    dranimate.liveFeedScene.add(cameraFeedPlane);

    cameraFeedPlane.position.set(10, 0, 0);
    cameraFeedPlane.lookAt(new THREE.Vector3(0, 0, 0));
    //////////////////
  }

  const onHandDetectionCameraChange = (event: React.ChangeEvent<{
    value: string;
  }>): void => {
    dispatch(setHandposeInputCamera(event.target.value));

    //////////////////
    dranimate.handTrackingService.video = document.getElementById(`hand-pose-${event.target.value}`);
    //////////////////
  }

  const onFpsChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setFps(event.target.value));
  }

  const onSave = (): void => {
    // TODO - Add save to firebase
  }

  const isRegularSize = availableCanvasSizes.some((size) => {
    return size.x === Number(canvasSize.x) && size.y === Number(canvasSize.y);
  })

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((device) => {
        return device.kind === 'videoinput';
      });
      dispatch(setListOfAvailableInputCameras(videoDevices.map((deviceInfo) => deviceInfo.label)));
      dispatch(setLivedrawInputCamera(videoDevices[0].label));
      dispatch(setHandposeInputCamera(videoDevices[0].label));
    });
  }, [])

  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth='xs' fullWidth>
      <DialogTitle>
        Project properties
      </DialogTitle>
      <DialogContent>
        {/* Canvas Dimensions */}
        <DialogContentText>
          Canvas dimensions
        </DialogContentText>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="canvas-resolution">
            Select a frame
          </InputLabel>
          <Select
            labelId="canvas-resolution"
            value={isRegularSize ?`${canvasSize.x}x${canvasSize.y}` : 'Custom'}
            onChange={onCanvasSizeChanged}
            label="Select a frame"
            defaultValue={'Custom'}
          >
            {availableCanvasSizes.map((size) => {
              return (
                <MenuItem
                  key={`${size.x}x${size.y}`}
                  value={`${size.x}x${size.y}`}
                >
                  {size.x}x{size.y}
                </MenuItem>
              );
            })}
            <MenuItem
              key='Custom'
              value='Custom'
            >
              Custom
            </MenuItem>
          </Select>
        </FormControl>
        <Box m={2} />
        <CanvasSizePicker
          width={canvasSize.x}
          height={canvasSize.y}
          onChange={onCustomCanvasSizeChanged}
        />

        <Box m={2} />

        {/* Background Color */}
        <DialogContentText>
          Background Color
        </DialogContentText>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="background-color">
            Select a color
          </InputLabel>
          <Select
            labelId="background-color"
            value={backgroundColor.value}
            onChange={onBackgroundColorChanged}
            label="Select a color"
          >
            {availableCanvasColors.map((color) => {
              return (
                <MenuItem
                  key={color.name}
                  value={color.value}
                >
                  {color.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        
        <Box m={1} />

        {/* Animation (fps) */}
        <DialogContentText>
          Animation
        </DialogContentText>
        <TextField
          fullWidth
          label='FPS'
          variant='outlined'
          onChange={onFpsChange}
          value={fps}
          inputProps={{
            min: "5",
            max: "30",
            step: "1",
            type: 'number'
          }}
        />

        <Box m={1} />

        {/* Live video camera selection */}
        <DialogContentText>
          Live video input camera
        </DialogContentText>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="livedraw-puppet-camera-input">
            Select a camera
          </InputLabel>
          <Select
            labelId="livedraw-puppet-camera-input"
            value={livedrawInputCamera}
            onChange={onLivedrawCameraChanged}
            label="Select a camera"
          >
            {inputCameraList.map((cameraId) => {
              return (
                <MenuItem
                  key={cameraId}
                  value={cameraId}
                >
                  {cameraId}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        
        <Box m={1} />

        {/* Handpose camera input selection */}
        <DialogContentText>
          Hand detection camera
        </DialogContentText>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="hand-detection-camera">
            Select a camera
          </InputLabel>
          <Select
            labelId="hand-detection-camera"
            value={handposeInputCamera}
            onChange={onHandDetectionCameraChange}
            label="Select a camera"
          >
            {inputCameraList.map((cameraId: string) => {
              return (
                <MenuItem
                  key={cameraId}
                  value={cameraId}
                >
                  {cameraId}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

      </DialogContent>
      <DialogActions>
      <ColorButton onClick={onSave}>
        Save
      </ColorButton>
      </DialogActions>
    </Dialog>
  )
}
export default ProjectProperties;
