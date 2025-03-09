export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		let slug = url.searchParams.get("slug");

		if (!slug) {
			return new Response(JSON.stringify({ error: "Missing slug parameter" }), {
				status: 400,
				headers: getCorsHeaders()
			});
		}

		const MAIN_COLLECTION_ID = "";
		const NESTED_COLLECTION_ID = "";
		const FIELD = "";
		const API_URL = `https://api.webflow.com/v2/collections/${MAIN_COLLECTION_ID}/items`;
		const API_KEY = env.WEBFLOW_API_KEY;

		try {
			const response = await fetch(API_URL, {
				method: "GET",
				headers: {
					"Accept": "application/json",
					"Authorization": `Bearer ${API_KEY}`
				}
			});

			if (!response.ok) {
				return new Response(JSON.stringify({ error: "Failed to fetch data", status: response.status }), {
					status: response.status,
					headers: getCorsHeaders()
				});
			}

			let data = await response.json();
			const matchedItem = data.items.find(item => item.fieldData.slug === slug);

			if (!matchedItem) {
				return new Response(JSON.stringify({ error: "No item found with the given slug" }), {
					status: 404,
					headers: getCorsHeaders()
				});
			}

			let featureIDs = matchedItem.fieldData[FIELD] || [];

			// Fetch feature details
			const featureDetails = await Promise.all(
				featureIDs.map(async (featureId) => {
					const FEATURE_API_URL = `https://api.webflow.com/v2/collections/${NESTED_COLLECTION_ID}/items/${featureId}/live`;
					const featureResponse = await fetch(FEATURE_API_URL, {
						method: "GET",
						headers: {
							"Accept": "application/json",
							"Authorization": `Bearer ${API_KEY}`
						}
					});

					if (!featureResponse.ok) {
						return { id: featureId, error: "Failed to fetch feature details" };
					}

					let featureData = await featureResponse.json();
					return featureData.fieldData.name;
				})
			);

			return new Response(JSON.stringify(featureDetails), {
				headers: getCorsHeaders()
			});

		} catch (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
				headers: getCorsHeaders()
			});
		}
	}
};

// Function to return CORS headers
function getCorsHeaders() {
	return {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*",  // Change "*" to "https://your-webflow-site.com" for security
		"Access-Control-Allow-Methods": "GET, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization"
	};
}

// Handle OPTIONS preflight requests
addEventListener("fetch", event => {
	if (event.request.method === "OPTIONS") {
		event.respondWith(
			new Response(null, {
				status: 204,
				headers: getCorsHeaders()
			})
		);
	}
});
