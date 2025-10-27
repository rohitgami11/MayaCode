# Images Directory

This directory stores images that are served by the backend API.

## Folder Structure

```
Backend/public/images/
  ├── help-posts/
  │   ├── help-posts.png      (for number 1)
  │   ├── help-posts2.png     (for number 2)
  │   ├── help-posts3.png     (for number 3)
  │   └── help-posts4.png     (for number 4)
  ├── stories/
  │   └── stories.png         (for number 1)
  └── unity/
      └── unity.png           (for number 1)
```

## Setup Instructions

1. Copy images from `Frontend/assets/images/` to this directory structure:
   - `help-posts.png` → `help-posts/help-posts1.png` (or keep as `help-posts.png` for number 1)
   - `help-posts2.png` → `help-posts/help-posts2.png`
   - `help-posts3.png` → `help-posts/help-posts3.png`
   - `help-posts4.png` → `help-posts/help-posts4.png`
   - `stories.png` → `stories/stories1.png`
   - `unity.png` → `unity/unity1.png`

## API Usage

Images are served via the `/api/images/:category/:number` endpoint.

### Examples:
- `GET /api/images/help-posts/1` → Returns `help-posts/help-posts1.png`
- `GET /api/images/help-posts/2` → Returns `help-posts/help-posts2.png`
- `GET /api/images/stories/1` → Returns `stories/stories1.png`

## Important Notes

- Images are served WITHOUT any transformation
- Only PNG format is supported
- Images should maintain their original quality

