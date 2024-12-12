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
		this.block = this.el.querySelector('[data-ui-block]')
		this.footer = this.el.querySelector('[data-ui-footer]')

		this.title = this.el.querySelector('h2')
		const chars = this.title.innerHTML

		this.title.innerHTML = ''

		for (let i = 0; i < chars.length; i++) {
			const char = chars[i]
			const span = document.createElement('span')
			span.classList.add('char-anim')
			span.innerHTML = char
			this.title.appendChild(span)
		}

		this.btn.addEventListener('click', this.toggle)

		window.addEventListener('click', this.close)
		this.popin.addEventListener('click', (e) => e.stopPropagation())

		this.webGPU = !window.navigator.gpu ? false : true

		const webgl = this.el.querySelector('.webg')

		if (!this.webGPU) {
			webgl.innerHTML = 'WebGL'
		}

	}

	noMultiDraw() {
		this.cantClose = true

		this.block.classList.add('no-multidraw')

		// animate text
		this.popin.classList.add('show')
		this.animateText()
	}

	toggle = (e) => {
		if (this.cantClose) return
		e.stopPropagation()
		if (this.popin.classList.contains('show')) {
			this.popin.classList.remove('show')
		} else {
			// animate text
			this.popin.classList.add('show')
			this.animateText()

		}
	}

	close = () => {
		if (this.cantClose) return
		this.popin.classList.remove('show')
	}

	animateText() {
		this.tl?.kill()
		this.tl = gsap.timeline({ delay: 0.2 })

		this.tl.fromTo(
			this.title.children,
			{
				scale: 0,
				opacity: 0,
			},
			{
				scale: 1,
				opacity: 1,
				ease: 'power3.out',
				duration: 1,
				stagger: 0.02,
			},
		)

		this.tl.fromTo(
			this.block,
			{
				opacity: 0,
				y: 20
			},
			{
				opacity: 1,
				y: 0,
				ease: 'power3.out',
				duration: 0.8,
			},
			0.4
		)
		this.tl.fromTo(
			this.footer,
			{
				opacity: 0,
				y: 20
			},
			{
				opacity: 1,
				y: 0,
				ease: 'power3.out',
				duration: 0.8,
			},
			0.6
		)

		this.tl.play()
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