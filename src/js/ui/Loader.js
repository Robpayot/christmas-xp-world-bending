import gsap from "gsap"

function splitWord(text) {
	const result = []

	text.split(' ').forEach((word) => {
		result.push(word + ' ')
	})

	return result
}

export default class UILoader {
	constructor(el) {
		this.el = el

		this.text = this.el.querySelector('.loader__text')
		const chars = this.text.innerHTML

		this.text.innerHTML = ''

		for (let i = 0; i < chars.length; i++) {
			const char = chars[i]
			const span = document.createElement('span')
			span.classList.add('char-anim')
			span.innerHTML = char
			this.text.appendChild(span)
		}

		this.animate()

	}

	animate() {
		const tl = gsap.timeline({ repeat: -1, onRepeat: () => {
			if (this.canHide) {
				this.hide()

			}
			if (this.loaded) {
				this.canHide = true
			}
		} })

		tl.fromTo(
			this.text.children,
			{
				scale: 0,
				opacity: 0,
			},
			{
				scale: 1,
				opacity: 1,
				ease: 'expo.out',
				duration: 1.8,
				stagger: 0.1,
			},
		)
	}

	loaded() {
		this.loaded = true
	}

	hide() {
		this.el.classList.add('hide')
	}
}