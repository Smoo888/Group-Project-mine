 <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>

  <script>
    // Load navbar and footer
    fetch('navbar.html')
      .then(res => res.text())
      .then(html => {
        document.getElementById('navbar').innerHTML = html;
        M.Sidenav.init(document.querySelectorAll('.sidenav'));
      });

    fetch('footer.html')
      .then(res => res.text())
      .then(html => {
        document.getElementById('footer').innerHTML = html;
      });

    // Load product data
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id')) || 0;

    fetch('products.json')
      .then(res => res.json())
      .then(products => {
        if (!Array.isArray(products) || products.length === 0) {
          throw new Error("No products found.");
        }

        const product = products[productId] || products[0];
        const imageSrc = product.image || './imgs/fallback.jpg';
        const longDescHTML = product.longDesc
          ? `<p class="flow-text">${product.longDesc}</p>`
          : '';
        const featuresHTML = product.features?.length
          ? `<h6>Features:</h6><ul class="browser-default">${product.features.map(f => `<li>${f}</li>`).join('')}</ul>`
          : '';

        const html = `
          <div class="product-info">
            <h3>${product.name}</h3>
            <h6 class="grey-text">Travel Essential</h6>
            <h5 class="blue-text text-darken-2">$${product.price.toFixed(2)}</h5>
            <p>${product.desc}</p>
            <button class="btn black">Add to Cart</button>
            <p class="grey-text" style="margin-top: 1rem;">Shipping & return policy available</p>
            ${longDescHTML}
            ${featuresHTML}
          </div>
          <div class="product-image">
            <img src="${imageSrc}" alt="${product.name}" onerror="this.onerror=null; this.src='./imgs/fallback.jpg';">
          </div>
        `;

        document.getElementById('product-detail').innerHTML = html;
      })
      .catch(err => {
        console.error('Error loading product:', err);
        document.getElementById('product-detail').innerHTML = '<p class="red-text">Unable to load product.</p>';
      });
