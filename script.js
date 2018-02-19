/*
	This API fetches an array of 100 objects containing a user.
	See example of fetched item below:

	{
		"id": 1,
		"name": "Leanne Graham",
		"username": "Bret",
		"email": "Sincere@april.biz",
		"address": {
			"street": "Kulas Light",
			"suite": "Apt. 556",
			"city": "Gwenborough",
			"zipcode": "92998-3874",
			"geo": {
				"lat": "-37.3159",
				"lng": "81.1496"
			}
		},
		"phone": "1-770-736-8031 x56442",
		"website": "hildegard.org",
		"company": {
			"name": "Romaguera-Crona",
			"catchPhrase": "Multi-layered client-server neural-net",
			"bs": "harness real-time e-markets"
		}
	}	
*/

class SearchApp {
	constructor(API_URL) {
		this.API_URL = API_URL

		// Set the DOM elems
		this._form = document.querySelector('#search-form')
		this._searchInput = document.querySelector('#search-input')
		this._itemsList = document.querySelector('#items-list')
		this._resultsList = document.querySelector('#results-list')

		// This is used to add/remove .selected class from the search results items
		// without having to re-render them
		this._cachedResult = null

		this.searchResults = []
		this.selectedResultIndex = 0

		// List with saved items
		this.itemsList = []
	}
	
	init() {
		this.bindEvents()
	}

	// Some helper functions to show/hide things
	showItemsList() { this._itemsList.style.display = 'block' }
	hideItemsList() { this._itemsList.style.display = 'none' }
	
	showResultsList() { this._resultsList.style.opacity = '1' }
	hideResultsList() { this._resultsList.style.opacity = '0' }

	bindEvents() {
		let timer
		this._searchInput.addEventListener('keydown', (e) => {
			// If we press up or down we should browse the results
			if(e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				if(e.key === 'ArrowDown') {
					this.selectResult('next')
				} else {
					this.selectResult('prev')
				}

			// Else we perform a search (if we stop typing within 500ms to prevent flooding the API)
			} else {
				clearTimeout(timer)

				timer = setTimeout(() => {
					this.fetchResults(this._searchInput.value)
				}, 500)
			}
		})

		// When we press enter
		this._form.addEventListener('submit', (e) => {
			e.preventDefault()

			// Get the selected item from the search results
			this.addToList(this.searchResults[this.selectedResultIndex])

			// Hide the results and empty the input field
			this.hideResultsList()
			this._searchInput.value = ''
			this.selectedResultIndex = 0

			// Render the saved items
			this.renderItemsList()
		})

		// When clicking on a list item, look for if the button was clicked
		// Delegating since this list is dynamic in the DOM
		this._itemsList.addEventListener('click', (e) => {

			// Did we click the button?
			if(e.target.parentNode.tagName.toLowerCase() === 'button') {
				// Get the list items and its index
				const _li = e.target.parentNode.parentNode
				const index = parseInt( _li.getAttribute('data-index') )

				// Remove that item
				this.removeFromList(index)
			}
		})
	}

	addToList(item) {
		this.itemsList.push({
			artist: item.artistName,
			track: item.trackName,
			addedTime: new Date()
		})
	}
	removeFromList(index) {
		this.itemsList.splice(index, 1)
		this.renderItemsList()
	}

	renderItemsList() {
		let html = ''
		// Iterate over the list and set its HTML
		this.itemsList.forEach((item, i) => {
			const year  = item.addedTime.getFullYear()
			const month = ( '0' + item.addedTime.getMonth() ).substr(-2)
			const day   = ( '0' + item.addedTime.getDay() ).substr(-2)
			const hour  = ( '0' + item.addedTime.getHours() ).substr(-2)
			const min   = ( '0' + item.addedTime.getMinutes() ).substr(-2)

			html += `
				<li data-index=${i}>
					${item.artist} - ${item.track}
					<span class="date">${year}-${month}-${day} ${hour}:${min}</span>
					<button><span>✕</span></button>
				</li>
			`
		})

		this._itemsList.innerHTML = html

		// Make sure to display it
		this.showItemsList()
	}

	selectResult(direction) {
		// Arrow down
		if(direction === 'next') {
			// Don't select any index above the number of result
			if(this.selectedResultIndex < this.searchResults.length - 1) {
				this.selectedResultIndex++
			}

		// Arrow up
		} else {
			// Dont select any number below 0
			if(this.selectedResultIndex > 0) {
				this.selectedResultIndex--
			}
		}

		// Remove all selected classes
		this._cachedResult.forEach(li => {
			li.classList.remove('selected')
		})

		// ... and add it back on the selected index
		this._cachedResult[this.selectedResultIndex].classList.add('selected')
	}

	// Fetch the results from the API, set the results, display it and cache the DOM
	// This is used for adding/removing .selected class when arrowing down/up
	fetchResults(searchString) {
		fetch( this.API_URL + encodeURI(searchString) )
			.then( response => response.json() )
			.then(json => {
				this.searchResults = json.results
				this.displayResults()
				this.cacheResult()
			})
	}

	cacheResult() {
		this._cachedResult = document.querySelectorAll('#results-list li')
	}

	emptyResults() {
		this._resultsList.innerHTML = ''
		this.searchResults = []
	}

	// Build the HTML for the search results
	buildHTML() {
		let html = ''
		this.searchResults.forEach((result, i) => {
			html += `<li ${this.selectedResultIndex === i ? 'class="selected"' : ''}>${result.artistName} - ${result.trackName}</li>`
		})
		this._resultsList.innerHTML = `<h2>Sökresultat</h2>${html}`
	}

	displayResults() {
		if(this.searchResults.length > 0) {
			this.buildHTML()
			this.showResultsList()
		} else {
			this.hideResultsList()
			this.emptyResults()
		}
	}
}

// Define the API URL and instantiate the class
const API_URL = 'https://itunes.apple.com/search?country=US&limit=10&term='
const app = new SearchApp(API_URL)

// Run it...
app.init()