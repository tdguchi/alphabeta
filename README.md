# Alpha-Beta Visualizer - Flask Application

A Flask web application for visualizing the Alpha-Beta pruning algorithm in minimax trees. This interactive tool allows users to create, modify, and step through the algorithm execution with a modern, responsive interface.

## Features

- **Interactive Tree Creation**: Create custom minimax trees by clicking to add nodes
- **Algorithm Visualization**: Step through the Alpha-Beta pruning algorithm with visual feedback
- **Real-time Editing**: Modify leaf node values with inline editing
- **Random Tree Generation**: Generate random trees for testing and demonstration
- **Responsive Design**: Modern Bootstrap 5 interface that works on all devices
- **Monochromatic Theme**: Clean black/grey/white design with colored nodes for algorithm clarity

## Installation

### Docker Deployment (Recommended)

1. **Build and run with Docker Compose**:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```

3. **To stop the application**:
   ```bash
   docker-compose down
   ```

### Manual Installation

1. **Create a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python app.py
   ```

### Traditional Docker Deployment

1. **Build the Docker image**:
   ```bash
   docker build -t alpha-beta-visualizer .
   ```

2. **Run the container**:
   ```bash
   docker run -p 5000:5000 alpha-beta-visualizer
   ```

## Usage

### Creating a Tree
- Click the "Generar Árbol Aleatorio" button to create a random tree
- Or manually add nodes by selecting a node and clicking "Añadir Hijo"

### Editing Nodes
- Click on any leaf node to edit its value
- Use the inline editor that appears to set numeric values

### Running the Algorithm
- **Ejecutar Completo**: Run the complete Alpha-Beta algorithm at once
- **Paso**: Step through the algorithm one move at a time
- **Atrás**: Go back one step in the algorithm execution
- **Reiniciar**: Reset the algorithm to start over

### Visual Indicators
- **Green nodes**: Maximizing player nodes
- **Red nodes**: Minimizing player nodes
- **Blue nodes**: Currently being evaluated
- **Grey nodes**: Pruned nodes (cut off by Alpha-Beta)

## Project Structure

```
Alpha-Beta-Visualizer-main/
├── app.py                      # Flask application entry point
├── requirements.txt            # Python dependencies
├── Dockerfile                 # Container definition
├── docker-compose.yml         # Docker Compose configuration
├── .dockerignore              # Docker build context exclusions
├── .gitignore                 # Git ignore file
├── static/                    # Static assets (served by Flask)
│   ├── css/
│   │   └── styles.css         # Application styles
│   ├── js/
│   │   └── app.js             # Main application logic
│   └── images/
│       └── favicon.ico        # Application icon
├── templates/
│   └── index.html             # Main HTML template (uses Flask templating)
└── venv/                      # Virtual environment (created on first run)
```

## Flask Conversion

This application has been converted from a static web application to a full Flask web application with the following improvements:

- **Server-side routing**: Proper URL handling and template rendering
- **Static asset management**: Organized file structure with Flask's static file serving
- **Template system**: Uses Flask's Jinja2 templating for dynamic content
- **Production ready**: Includes Docker support for easy deployment
- **Development tools**: Auto-reload and debug mode for development
- **Virtual environment**: Isolated Python dependencies

## Technical Details

- **Backend**: Flask 3.0.0 with Python 3.x
- **Frontend**: Vanilla JavaScript with HTML5 Canvas
- **Styling**: Bootstrap 5.3.3 with custom CSS
- **Icons**: Font Awesome 6.4.0
- **Containerization**: Docker with Docker Compose

## Development

To run in development mode:

```bash
export FLASK_ENV=development
python app.py
```

The application will automatically reload when you make changes to the code.

For Docker development:
```bash
docker-compose build    # Build the image
docker-compose up -d    # Start services
docker-compose logs -f  # View logs
docker-compose down     # Stop services
```

## Algorithm Details

The Alpha-Beta pruning algorithm is an optimization of the minimax algorithm that eliminates branches that cannot possibly influence the final decision. This visualization shows:

1. **Alpha values**: The best value the maximizing player has found so far
2. **Beta values**: The best value the minimizing player has found so far
3. **Pruning**: When beta ≤ alpha, the remaining branches are pruned

## Browser Compatibility

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

This project is open source and available under the MIT License.
