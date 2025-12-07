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
'Historical Drama',
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
'Non-fiction',
'Paranormal',
'Coming of age', 
'Folklore',
'Biography',
'Religion',
'Nature',
'Children’s literature',
'Cozy',
'Survival', 
'Apocalypse'
];

//get array of all 'doors' class elements
const doors = document.querySelectorAll('.door');
let previousResults = [];

document.querySelector('#spinner').addEventListener('click', () => spin());
document.querySelector('#reseter').addEventListener('click', () => {
	previousResults = [];
	init();
});

function init(firstInit = true, item_sets = 1, duration_seconds = 1) {
	console.log(firstInit);
	for (const door of doors) {
		//exit early if .spinned is 1
		if (firstInit == true) {
			door.dataset.spinned = '0';
		} else if (door.dataset.spinned === '1') {
			return;
		}
		
		const boxes = door.querySelector('.boxes');
		//our clone handles all of the transition stuff (like a body double),
		//and then at the end, we will swap back to our original box
		const boxesClone = boxes.cloneNode(false);
		const pool = ['?'];


		if (firstInit == false) {
			let loop_count = Math.max(1, item_sets);

			//create an array of all the genres a minimum of one time
			//if 'item_sets' is larger, this creates more duplicates in the array
			const arr = [];
			for (let i = 0; i < loop_count; i++) {
				arr.push(...genres);
			}
			pool.push(...shuffle(arr));
			let lastIndex = pool.at(-1);

			//reroll if the result is not unique
			while (previousResults.includes(lastIndex)) {
				pool.push(...shuffle(arr));
			}
			previousResults.push(lastIndex);

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
					this.querySelectorAll('.box').forEach((box, index) => {
						if (index > 0) {
							this.removeChild(box);
						}
					});
				},
				{ once: true }
			);
		}

		//create new box nodes, fill it with an item from the pool,
		//then attach to the boxesClone
		for (let i = pool.length - 1; i >= 0; i--) {
			const box = document.createElement('div');
			box.classList.add('box');
			box.style.width = door.clientWidth + 'px';
			box.style.height = door.clientHeight + 'px';
			box.textContent = pool[i];
			boxesClone.appendChild(box);
		}

		boxesClone.style.transitionDuration = `${Math.max(1, duration_seconds)}s`;
		//move boxesClone offscreen
		boxesClone.style.transform = `translateY(-${door.clientHeight * (pool.length - 1)}px)`;
		//replace box with boxesClone
		door.replaceChild(boxesClone, boxes);
	}
}

async function spin() {
	//set up the boxes for transition
	init(false, 1, 4);

	for (const door of doors) {
		const boxes = door.querySelector('.boxes');
		const delayTime = 300;
		//set the boxes loose
		boxes.style.transform = 'translateY(0)';
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

init();
