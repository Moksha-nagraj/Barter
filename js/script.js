// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.querySelector('.md\\:hidden button');
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'md:hidden hidden bg-white shadow-lg absolute w-full z-10';
    mobileMenu.innerHTML = `
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="index.html" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600">Browse Items</a>
            <a href="list-item.html" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600">List Item</a>
            <a href="dashboard.html" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600">Dashboard</a>
            <a href="signin.html" class="block px-3 py-2 rounded-md text-base font-medium text-white bg-green-600">Sign In</a>
        </div>
    `;
    document.body.appendChild(mobileMenu);

    mobileMenuButton.addEventListener('click', function() {
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
            mobileMenu.classList.remove('hidden');
        } else {
            mobileMenu.classList.add('hidden');
        }
    });
});

// Form validation for list-item.html
if (document.getElementById('item-title')) {
    document.querySelector('form').addEventListener('submit', function(e) {
        const title = document.getElementById('item-title').value;
        const images = document.getElementById('cloudinary_image_urls').value;
        
        if (!title || !images) {
            e.preventDefault();
            alert('Please add a title and at least one image');
        }
    });
}