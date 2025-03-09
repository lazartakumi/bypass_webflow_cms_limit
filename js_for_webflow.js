document.addEventListener("DOMContentLoaded", function () {

	const slugDivs = document.querySelectorAll(".slug");

	const slugArray = Array.from(slugDivs).map(div => div.textContent.trim());

	slugArray.forEach(slug => {
		console.log(slug);
		const apiUrl = 'HTTPS://YOUR_URL_HERE/?slug='+slug;

		fetch(apiUrl)
			.then(response => {
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				return response.json();
			})
			.then(data => {
				if (Array.isArray(data)) {
					const container = document.querySelector(`div[output="${slug}"]`);

					data.forEach(item => {
						const p = document.createElement("p");
						p.textContent = item;
						container.appendChild(p);
					});
				} else {
					console.error("Unexpected data format", data);
				}
			})
			.catch(error => console.error("Error fetching data:", error));
	});

});