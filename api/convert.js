const { getPdfFromHtml } = require('../service/convert')

// Cache header max age
const maxAge = 24 * 60 * 60

module.exports = async (req, res) => {
	try {
		// Only allow GET requests
		if (req.method === 'GET') return res.status(405).end()

		// Strip leading slash from request path
		let html = req.body.html
		const css = req.body.css

		if (css) {
			html = html.replace('</head>', `<style>${ css }</style></head>`)
		}

		console.log(`Converting PDF`)
		const pdfBuffer = await getPdfFromHtml(html)

		if (!pdfBuffer) return res.status(400).send('Error: could not generate PDF')

		// Instruct browser to cache PDF for maxAge ms
		if (process.env.NODE_ENV !== 'development') res.setHeader('Cache-control', `public, max-age=${ maxAge }`)

		// Set Content type to PDF and send the PDF to the client
		res.setHeader('Content-type', 'application/pdf')
		res.send(pdfBuffer)

	} catch (err) {
		if (err.message === 'Protocol error (Page.navigate): Cannot navigate to invalid URL')
			return res.status(404).end()

		console.error(err)
		res.status(500).send('Error: Please try again.')
	}
}