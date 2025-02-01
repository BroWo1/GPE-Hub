/*
document.addEventListener('DOMContentLoaded', function() {
      const sidebar = document.querySelector('.sidebar');

      // Read the stored state and apply the class if necessary
      const sidebarState = localStorage.getItem('sidebarState');
      if (sidebarState === 'expanded') {
        sidebar.classList.add('expanded');
      } else {
        sidebar.classList.remove('expanded');
      }

      // When hovering over the sidebar, set state to "expanded"
      sidebar.addEventListener('mouseenter', () => {
        localStorage.setItem('sidebarState', 'expanded');
        sidebar.classList.add('expanded');
      });

      // When the mouse leaves, set state to "collapsed"
      sidebar.addEventListener('mouseleave', () => {
        localStorage.setItem('sidebarState', 'collapsed');
        sidebar.classList.remove('expanded');
      });
    });
*/