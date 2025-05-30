const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'testimonials.json');

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Helper to read/write testimonials
function readTestimonials() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}
function writeTestimonials(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all testimonials
app.get('/api/testimonials', (req, res) => {
  res.json(readTestimonials());
});

// Add a new testimonial
app.post('/api/testimonials', (req, res) => {
  const { name, role, feedback, photo, linkedin } = req.body;
  if (!name || !role || !feedback) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const testimonials = readTestimonials();
  testimonials.push({ id: uuidv4(), name, role, feedback, photo, linkedin, approved: false });
  writeTestimonials(testimonials);
  res.status(201).json({ message: 'Testimonial submitted for approval' });
});

// Approve a testimonial by id
app.patch('/api/testimonials/:id/approve', (req, res) => {
  const testimonials = readTestimonials();
  const idx = testimonials.findIndex(t => t.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Testimonial not found' });
  }
  testimonials[idx].approved = true;
  writeTestimonials(testimonials);
  res.json({ message: 'Testimonial approved' });
});

// Delete a testimonial by id
app.delete('/api/testimonials/:id', (req, res) => {
  const testimonials = readTestimonials();
  const idx = testimonials.findIndex(t => t.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Testimonial not found' });
  }
  testimonials.splice(idx, 1);
  writeTestimonials(testimonials);
  res.json({ message: 'Testimonial deleted' });
});

// Get only approved testimonials (for public)
app.get('/api/testimonials/approved', (req, res) => {
  const testimonials = readTestimonials();
  res.json(testimonials.filter(t => t.approved));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
