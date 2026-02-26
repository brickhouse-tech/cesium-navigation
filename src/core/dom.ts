/**
 * DOM manipulation utilities to replace Knockout.js templates
 */

/**
 * Create a DOM element from an HTML string
 */
export function createFragmentFromTemplate(template: string): DocumentFragment {
  const temp = document.createElement('div');
  temp.innerHTML = template.trim();
  const fragment = document.createDocumentFragment();
  while (temp.firstChild) {
    fragment.appendChild(temp.firstChild);
  }
  return fragment;
}

/**
 * Load a view (HTML template) into a container and bind it to a view model
 */
export function loadView(template: string, container: HTMLElement, viewModel?: any): void {
  const fragment = createFragmentFromTemplate(template);
  container.appendChild(fragment);
  
  if (viewModel) {
    // Bind event handlers from the view model to the DOM elements
    bindViewModelToContainer(container, viewModel);
  }
}

/**
 * Bind view model methods to data-bind attributes in the container
 */
function bindViewModelToContainer(container: HTMLElement, viewModel: any): void {
  // Find all elements with event handlers
  const elementsWithEvents = container.querySelectorAll('[data-bind]');
  
  elementsWithEvents.forEach((element) => {
    const bindAttr = element.getAttribute('data-bind');
    if (!bindAttr) return;
    
    // Parse data-bind attribute (simplified version)
    const bindings = parseDataBind(bindAttr);
    
    Object.entries(bindings).forEach(([key, value]) => {
      if (key === 'click' && typeof viewModel[value] === 'function') {
        element.addEventListener('click', (e) => viewModel[value].call(viewModel, viewModel, e));
      } else if (key === 'mousedown' && typeof viewModel[value] === 'function') {
        element.addEventListener('mousedown', (e) => viewModel[value].call(viewModel, viewModel, e));
      } else if (key === 'dblclick' && typeof viewModel[value] === 'function') {
        element.addEventListener('dblclick', (e) => viewModel[value].call(viewModel, viewModel, e));
      }
    });
  });
}

/**
 * Simple parser for data-bind attributes
 */
function parseDataBind(bindAttr: string): Record<string, string> {
  const result: Record<string, string> = {};
  
  // Match patterns like "click: methodName" or "event: { mousedown: method }"
  const simplePattern = /(\w+):\s*([a-zA-Z_]\w*)/g;
  let match;
  
  while ((match = simplePattern.exec(bindAttr)) !== null) {
    const key = match[1];
    const value = match[2];
    if (key && value) {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Set SVG path content
 */
export function setSvgPath(element: HTMLElement, path: string, width: number, height: number): void {
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${path}</svg>`;
  element.innerHTML = svg;
}
