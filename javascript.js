const genres = [
'Horror',
'Fantasy',
'Sci-Fi',
'YA',
'Romance',
'Mystery',
'Thriller',
'Detective',
'LGBTQ+',
'Historical Fiction',
'Memoir',
'True Crime',
'Dystopian',
'Classic Literature',
'Action',
'Adventure',
'Drama',
'Comedy',
'Western',
'War',
'Science',
'Non-Fiction',
'Paranormal',
'Coming of Age', 
'Folklore',
'Biography',
'Religion',
'Nature',
'Children’s Literature',
'Cozy',
'Survival', 
'Apocalypse'
];

let doors;
let previousResults = [];

document.querySelector('#spinner').addEventListener('click', () => spin());

function init(item_sets = 1, duration_seconds = 1) {
	for (const door of doors) {
		door.dataset.spinned = '0';
		if (door.dataset.prevItem == undefined) {
			door.dataset.prevItem = '?';
		}

		const boxes = door.querySelector('.boxes');
		//our clone handles all of the transition stuff (like a body double),
		//and then at the end, we will swap back to our original box
		const boxesClone = boxes.cloneNode(false);

		//create an array of all the genres a minimum of one time
		//if 'item_sets' is larger, this creates more duplicates in the array
		const arr = [];
		for (let i = 0; i < item_sets; i++) {
			arr.push(...genres);
		}
		let pool = [door.dataset.prevItem];
		pool.push(...shuffle(arr));
		let resultItem = pool.at(-1);

		//reroll if the result is not unique
		while (previousResults.includes(resultItem)) {
			//console.log("duplicate detected");
			pool = [door.dataset.prevItem];
			pool.push(...shuffle(arr));
			resultItem = pool.at(-1);
		}
		previousResults.push(resultItem);

		boxesClone.addEventListener(
			'transitionstart',
			function() {
				//have every box clone set itself to spinning when the time comes
				door.dataset.spinned = '1';
			},
			{ once: true }
		);

		boxesClone.addEventListener(
			'transitionend',
			//run a function for all the child boxes attached
			//to the boxesClone, and tell them to remove themselves
			function() {
				//make it so that the last item of this pool becomes the first item of the next pool
				//for seamless transition between generations
				door.dataset.prevItem = resultItem;
				door.dataset.spinned = '0';
				this.querySelectorAll('.box').forEach((box, index) => {
					if (index > 0) {
						this.removeChild(box);
					}
				});
			},
			{ once: true }
		);

		//create new box nodes, fill it with an item from the pool,
			//then attach to the boxesClone
		for (let i = pool.length - 1; i >= 0; i--) {
			const box = document.createElement('div');
			box.classList.add('box');
			box.style.height = door.clientHeight + 'px';
			box.textContent = pool[i];
			//add a fade effect if not first or last box
			if (i > 0 && i < pool.length-1) {
				box.classList.add('faded');
			}
			boxesClone.appendChild(box);
		}

		boxesClone.style.transitionDuration = `${duration_seconds}s`;
		//move boxesClone offscreen
		boxesClone.style.transform = `translateY(-${door.clientHeight * (pool.length - 1)}px)`;
		//replace box with boxesClone
		door.replaceChild(boxesClone, boxes);
	}
}

function ifAnySpinning() {
	for (const door of doors) {
		if (door.dataset.spinned == '1') {
			return true;
		}
	}
	return false;
}

function animateDoor(door, duration) {
		door.animate(
			[
				{transform: 'translateY(0)'},
				{transform: 'translateY(5px)', offset: 0.1},
				{transform: 'translateY(0)'},
			],
			{
				duration: duration,
			},
		);
}

async function spin() {
	//prevent button spam
	if (ifAnySpinning()) {
		return;
	}

	previousResults = [];
	//set up the boxes for transition
	init(1, 4);

	for (const door of doors) {
		const boxes = door.querySelector('.boxes');
		const delayTime = 200;
		//checkpoint here to make sure the browser will render the upcoming animations
		await new Promise((resolve) => setTimeout(resolve, 0));
		//set the boxes loose
		boxes.style.transform = 'translateY(0)';
		animateDoor(door, delayTime);
		//create a delay for each spinning door
		await new Promise((resolve) => setTimeout(resolve, delayTime));
	}
}

//uses the fisher-yates shuffle algorithm
function shuffle([...arr]) {
	let m = arr.length;
	while (m) {
		//generate random number between 0 and m, then decrement m
		const i = Math.floor(Math.random() * m--);
		//use descructuring to swap m and i
		[arr[m], arr[i]] = [arr[i], arr[m]];
	}
	return arr;
}

function createDoors(numDoors) {
	let newDoors = [];

	for (let i = 0; i < numDoors; i++) {
		let door = document.createElement('div');
		door.classList.add('door');
		let boxes = document.createElement('div');
		boxes.classList.add('boxes');
		door.appendChild(boxes);
		newDoors.push(door);
	}

	newDoors.forEach((door) => {
		animateDoor(door, 200);
	});

	document.querySelector('#door-container').replaceChildren(...newDoors);
	doors = document.querySelectorAll('.door');//get updated list of all doors
	previousResults = [];
	init();
}

//set up number input stuff
let numInput = document.querySelector('#number-input');
let inputBtns = document.querySelectorAll('.value-control');
numInput.addEventListener('change', () => {
	let currVal = numInput.value;
	let max = numInput.max;
	let min = numInput.min;

	//prevent inputted values outside the allowed range
	if (currVal <= max && currVal >= min) {
		createDoors(numInput.value);
	}
});

inputBtns.forEach((btn) => {
	btn.addEventListener('click', () => {
		createDoors(numInput.value);
	});
});

createDoors(numInput.value);
