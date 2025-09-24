export class ColorPicker {
    constructor(dropdownElement, colorInput, colorPreview, palette, onColorSelect) {
        this.dropdown = dropdownElement;
        this.colorInput = colorInput;
        this.colorPreview = colorPreview;
        this.palette = palette;
        this.onColorSelect = onColorSelect;
        this.dropdownContent = this.dropdown.querySelector('.dropdown-content');

        this.initialize();
    }

    initialize() {
        this.colorPreview.style.backgroundColor = this.colorInput.value;

        this.palette.forEach(color => {
            const swatchContainer = document.createElement('a');
            swatchContainer.href = '#';
            swatchContainer.classList.add('dropdown-item', 'color-swatch-item');
            
            const swatch = document.createElement('div');
            swatch.classList.add('color-swatch');
            swatch.style.backgroundColor = color;
            swatchContainer.appendChild(swatch);

            swatchContainer.addEventListener('click', (e) => {
                e.preventDefault();
                this.colorInput.value = color;
                this.colorPreview.style.backgroundColor = color;
                this.dropdown.classList.remove('is-active');
                this.onColorSelect(color);
            });
            this.dropdownContent.appendChild(swatchContainer);
        });

        this.dropdown.querySelector('.dropdown-trigger button').addEventListener('click', () => {
            this.dropdown.classList.toggle('is-active');
        });

        document.addEventListener('click', (event) => {
            if (!this.dropdown.contains(event.target)) {
                this.dropdown.classList.remove('is-active');
            }
        });
    }
}
