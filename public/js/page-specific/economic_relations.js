 // Debug utility
        function debugLog(message) {
            const debugElement = document.getElementById('debugLog');
            if (debugElement) {
                debugElement.innerHTML += '<br>' + new Date().toLocaleTimeString() + ': ' + message;
            }
            console.log('DEBUG:', message);
        }

        document.addEventListener('DOMContentLoaded', () => {
            debugLog('DOM Content Loaded');

            // Check if IntersectionObserver is supported
            if (!('IntersectionObserver' in window)) {
                debugLog('IntersectionObserver not supported - applying fallback');
                // Fallback: show all sections immediately
                document.querySelectorAll('.econ-v3-section').forEach(section => {
                    section.classList.add('in-view');
                });
                return;
            }

            /**
             * Professional number animation function
             */
            const animateNumber = (element, target) => {
                if (element.dataset.animated === 'true') {
                    debugLog('Element already animated, skipping');
                    return;
                }
                
                debugLog(`Starting animation for target: ${target}`);
                element.dataset.animated = 'true';

                let current = 0;
                const duration = 2000;
                const increment = target / (duration / 16);
                const startTime = performance.now();

                const updateCount = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    current = target * progress;
                    
                    if (progress < 1) {
                        element.innerText = Math.ceil(current).toLocaleString();
                        requestAnimationFrame(updateCount);
                    } else {
                        element.innerText = target.toLocaleString();
                        debugLog(`Animation completed for target: ${target}`);
                    }
                };
                
                requestAnimationFrame(updateCount);
            };

            // Set up IntersectionObserver
            const intersectionObserver = new IntersectionObserver((entries, observer) => {
                debugLog(`Observer triggered with ${entries.length} entries`);
                
                entries.forEach((entry, index) => {
                    debugLog(`Entry ${index}: intersecting = ${entry.isIntersecting}, ratio = ${entry.intersectionRatio}`);
                    
                    if (entry.isIntersecting) {
                        debugLog('Element entered viewport - triggering animations');
                        
                        // 1. Add 'in-view' class to show the section
                        entry.target.classList.add('in-view');
                        debugLog('Added in-view class');

                        // 2. Animate data bars
                        const bars = entry.target.querySelectorAll('.data-viz-bar-fill');
                        debugLog(`Found ${bars.length} data bars`);
                        
                        bars.forEach((bar, barIndex) => {
                            const percentage = bar.getAttribute('data-percentage');
                            debugLog(`Animating bar ${barIndex} to ${percentage}%`);
                            
                            // Add small delay for staggered effect
                            setTimeout(() => {
                                bar.style.width = percentage + '%';
                            }, barIndex * 200);
                        });

                        // 3. Animate number counters
                        const counters = entry.target.querySelectorAll('.stat-value[data-target]');
                        debugLog(`Found ${counters.length} counters`);
                        
                        counters.forEach((counter, counterIndex) => {
                            const targetValue = parseInt(counter.getAttribute('data-target'), 10);
                            debugLog(`Counter ${counterIndex}: target = ${targetValue}`);
                            
                            if (!isNaN(targetValue)) {
                                // Add delay for staggered effect
                                setTimeout(() => {
                                    animateNumber(counter, targetValue);
                                }, counterIndex * 300);
                            } else {
                                debugLog(`Invalid target value for counter ${counterIndex}`);
                            }
                        });

                        // 4. Stop observing this element
                        observer.unobserve(entry.target);
                        debugLog('Stopped observing element');
                    }
                });
            }, {
                threshold: 0.2,
                rootMargin: '50px'
            });

            // Start observing all sections
            const sectionsToAnimate = document.querySelectorAll('.econ-v3-section');
            debugLog(`Found ${sectionsToAnimate.length} sections to animate`);
            
            sectionsToAnimate.forEach((section, index) => {
                debugLog(`Observing section ${index}: ${section.id}`);
                intersectionObserver.observe(section);
            });

            debugLog('Animation setup complete');

            // Test button for debugging
            setTimeout(() => {
                const testButton = document.createElement('button');
                testButton.textContent = 'Test Animations';
                testButton.style.cssText = `
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    z-index: 10000;
                    padding: 10px;
                    background: #58A6FF;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                `;
                
                testButton.addEventListener('click', () => {
                    debugLog('Manual test triggered');
                    sectionsToAnimate.forEach(section => {
                        section.classList.add('in-view');
                        
                        const bars = section.querySelectorAll('.data-viz-bar-fill');
                        bars.forEach(bar => {
                            const percentage = bar.getAttribute('data-percentage');
                            bar.style.width = percentage + '%';
                        });
                        
                        const counters = section.querySelectorAll('.stat-value[data-target]');
                        counters.forEach(counter => {
                            const target = parseInt(counter.getAttribute('data-target'), 10);
                            if (!isNaN(target)) {
                                counter.dataset.animated = 'false'; // Reset animation flag
                                animateNumber(counter, target);
                            }
                        });
                    });
                });
                
                document.body.appendChild(testButton);
            }, 1000);
        });

        // Additional error handling
        window.addEventListener('error', (event) => {
            debugLog(`Error: ${event.message} at ${event.filename}:${event.lineno}`);
        });

        window.addEventListener('load', () => {
            debugLog('Page fully loaded');
        });