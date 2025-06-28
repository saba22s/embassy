// political-relations.js

document.addEventListener("DOMContentLoaded", () => {
    // ---- Accordion Logic ----
    // This function handles the expanding and collapsing of the agreements list.
    const accordionButtons = document.querySelectorAll(".accordion-button");

    accordionButtons.forEach(button => {
        button.addEventListener("click", () => {
            const accordionContent = button.nextElementSibling;
            const isExpanded = button.classList.contains("active");

            // Close all other accordions first for a cleaner experience
            // accordionButtons.forEach(btn => {
            //     btn.classList.remove("active");
            //     btn.nextElementSibling.style.maxHeight = null;
            // });

            if (!isExpanded) {
                button.classList.add("active");
                // Set max-height to the scrollHeight to make it expand smoothly
                accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
            } else {
                button.classList.remove("active");
                accordionContent.style.maxHeight = null; // Collapse it
            }
        });
    });

    // ---- Animate on Scroll Logic ----
    // This function adds the 'is-visible' class to elements when they enter the viewport.
    const animatedElements = document.querySelectorAll(".animate-on-scroll");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    // Optional: stop observing the element once it's visible
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for older browsers that don't support IntersectionObserver
        animatedElements.forEach(element => {
            element.classList.add("is-visible");
        });
    }
});