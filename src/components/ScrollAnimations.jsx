import { useEffect } from 'react';

export default function ScrollAnimations({ children }) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    const observeElements = () => {
      const elements = document.querySelectorAll('.fade-in, .fade-up, .fade-left, .fade-right');
      elements.forEach((el) => {
        if (!el.classList.contains('observed')) {
          observer.observe(el);
          el.classList.add('observed'); // označíme, že už ho sledujeme
        }
      });
    };

    observeElements();

    // sleduj DOM pro nově přidané elementy
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return <>{children}</>;
}
