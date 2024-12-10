import gsap from "gsap"

function splitWord(text) {
	const result = []

	text.split(' ').forEach((word) => {
		result.push(word + ' ')
	})

	return result
}

export default class UIPopin {
	constructor(el) {
		this.el = el

		this.btn = this.el.querySelector('[data-ui-btn]')
		this.popin = this.el.querySelector('[data-ui-popin]')

		this.btn.addEventListener('click', this.toggle)

	}

	toggle = () => {
		if (this.popin.classList.contains('show')) {
			this.popin.classList.remove('show')
		} else {
			this.popin.classList.add('show')

		}
	}

	// animate() {
	// 	const tl = gsap.timeline({ repeat: -1, onRepeat: () => {
	// 		if (this.canHide) {
	// 			this.hide()

	// 		}
	// 		if (this.loaded) {
	// 			this.canHide = true
	// 		}
	// 	} })

	// 	tl.fromTo(
	// 		this.text.children,
	// 		{
	// 			scale: 0,
	// 			opacity: 0,
	// 		},
	// 		{
	// 			scale: 1,
	// 			opacity: 1,
	// 			ease: 'expo.out',
	// 			duration: 1.8,
	// 			stagger: 0.1,
	// 		},
	// 	)
	// }

	loaded() {
		this.loaded = true
	}

	hide() {
		this.el.classList.add('hide')
	}
}