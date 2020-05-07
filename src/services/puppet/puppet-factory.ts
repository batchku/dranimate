import {
	Box3,
	BoxHelper,
	Color,
	Face3,
	Group,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	SphereGeometry,
	Texture,
	Vector2,
	Vector3,
	PlaneGeometry,
	DoubleSide,
	TextureLoader
} from 'three';

import * as THREE from 'three';

import Puppet from 'services/puppet/puppet';
import generateUniqueId from 'services/util/uuid';
import ControlPoint from 'services/puppet/control-point';
import SkinnedMesh from 'services/skinning/skinned-mesh';

function createAnchor(size, color) {
	const anchorGeometry = new SphereGeometry(size, 32, 32);
	const anchorMaterial = new MeshBasicMaterial({color: color, depthWrite: false});
	const anchor = new THREE.Mesh(anchorGeometry, anchorMaterial);
	anchor.visible = false;
	
	return anchor;
}

function createTexturedPlane(size, texturePath) {
	const anchorTexture = new TextureLoader().load(texturePath);
	anchorTexture.anisotropy = 8;
	anchorTexture.minFilter = THREE.LinearMipMapNearestFilter;
	const anchorGeometry = new PlaneGeometry(size, size);
	const anchorMaterial = new MeshBasicMaterial({
		side: DoubleSide,
		map: anchorTexture,
		transparent: true,
		depthWrite: false
	});
	const anchor = new Mesh(anchorGeometry, anchorMaterial);
	anchor.rotateX(Math.PI);
	anchor.visible = false;

	return anchor;
}

function createPuppetSelectionBox(threeMesh) {
	const boxHelperMesh = new BoxHelper(threeMesh, new Color(0xFFFFFF));
	if (boxHelperMesh.material instanceof MeshBasicMaterial) {
		boxHelperMesh.material.depthWrite = false;
	}
	boxHelperMesh.visible = false;

	const topAnchor = createAnchor(3, 0xFFFFFF);
	const rightAnchor = createAnchor(3, 0xFFFFFF);
	const bottomAnchor = createAnchor(3, 0xFFFFFF);
	const leftAnchor = createAnchor(3, 0xFFFFFF);

	const topLeftAnchor = createTexturedPlane(50, './assets/rotate-puppet.png');
	const bottomRightAnchor = createTexturedPlane(50, './assets/scale-puppet.png');

	const topRightAnchor = createAnchor(9, 0xFFFFFF);
	const bottomLeftAnchor = createAnchor(9, 0xFFFFFF);

	return {
		boxHelper: boxHelperMesh,
		topAnchor: topAnchor,
		rightAnchor: rightAnchor,
		bottomAnchor: bottomAnchor,
		leftAnchor: leftAnchor,
		topLeftAnchor: topLeftAnchor,
		bottomRightAnchor: bottomRightAnchor,
		topRightAnchor: topRightAnchor,
		bottomLeftAnchor: bottomLeftAnchor,
	};
}

//------- LOGIC FOR BUILDING PUPPETS, THIS IS TO KEEP CONSTRUCTION OUTSIDE OF PUPPET ENTITY ------//
function buildFromOptions(options) {
	const image = options.image;
	const id = options.id || generateUniqueId();
	const name = options.name || '';
	const verts = options.vertices;
	const faces = options.faces;
	const controlPoints = options.controlPoints;
	const imageNoBG = options.imageNoBG;

	/* Create texture */
	const canvas = document.createElement('canvas');
	canvas.width  = imageNoBG.width;
	canvas.height = imageNoBG.height;
	const context = canvas.getContext('2d');
	context.drawImage(imageNoBG, 0, 0, imageNoBG.width, imageNoBG.height, 0, 0, canvas.width, canvas.height);
	const imageTexture = new Texture(canvas);
	imageTexture.needsUpdate = true;

	/* Create puppet skin */
	const skin = new SkinnedMesh(verts, faces, controlPoints, imageTexture);
	
	/* Create flat vertex array */
	const vertsFlatArray = verts.reduce((flatArray, vert) => flatArray.concat(vert[0], vert[1]), []);
	const facesFlatArray = faces.map(face => face);

	const pickingMesh = skin.getProxyMesh();
	const pickingGeometry = skin.getProxyGeometry();
	const selectionBox = createPuppetSelectionBox(pickingMesh);

	const box3 = new Box3();
	box3.setFromObject(selectionBox.boxHelper);
	const size = box3.getSize(new Vector3());
	const halfSize = new Vector2(size.x, size.y).multiplyScalar(0.5);
	const vertexSum = pickingGeometry.vertices.reduce((sum, vertex) => ({
		x: sum.x + vertex.x,
		y: sum.y + vertex.y
	}), {x: 0, y: 0});
	const center = new Vector2(
		vertexSum.x / pickingGeometry.vertices.length,
		vertexSum.y / pickingGeometry.vertices.length
	);

	const controlPointPlanes = options.controlPointPositions.map((controlPoint: ControlPoint) => {
		const controlPointPlane = createTexturedPlane(50, `./assets/${controlPoint.label}.png`);
		controlPointPlane.position.z = 10;
		controlPointPlane.visible = false;

		return controlPointPlane;
	});

	// FOR TESTING THE CENTER OF THE PUPPET:
	// const centerSphere = new Mesh(
	//   new SphereGeometry(15, 32, 32),
	//   new MeshBasicMaterial({ color: 0x3300FF })
	// );
	// centerSphere.position.z = 20;
	// centerSphere.position.x = center.x;
	// centerSphere.position.y = center.y;

	const group = new Group();
	group.add(skin.getMesh());
	//group.add(skin.getProxyMesh());
	group.add(selectionBox.boxHelper);
	group.add(selectionBox.topAnchor);
	group.add(selectionBox.rightAnchor);
	group.add(selectionBox.bottomAnchor);
	group.add(selectionBox.leftAnchor);
	group.add(selectionBox.topLeftAnchor);
	group.add(selectionBox.bottomRightAnchor);
	group.add(selectionBox.topRightAnchor);
	group.add(selectionBox.bottomLeftAnchor);
	// group.add(centerSphere);
	controlPointPlanes.forEach(cp => group.add(cp));

	return {
		image,
		id,
		name,
		verts,
		faces,
		controlPoints,
		vertsFlatArray,
		facesFlatArray,
		skin,
		selectionBox,
		controlPointPlanes: controlPointPlanes,
		group,
		halfSize,
		center,
	};
}

export default function requestPuppetCreation(options) {

	const puppetData = {
		imageNoBG: options.imageNoBG,
		controlPointPositions: options.controlPointPositions,
		backgroundRemovalData: options.backgroundRemovalData,
		...buildFromOptions(options)
	};
	return new Puppet(puppetData);
}
