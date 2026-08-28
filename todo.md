# Image Deployment Fix

- [ ] Inspect all image references in the client source and identify whether they use local paths, Manus storage paths, or external URLs.
- [ ] Compare referenced assets with the production build output and Netlify configuration.
- [ ] Implement the smallest compatible fix for Netlify asset loading without changing server code.
- [ ] Run type checks and the production build.
- [ ] Verify the homepage image requests in the preview and save a checkpoint.
