 # Using Firestore for Image Storage

This project stores images directly in Firestore as Base64 strings instead of using Firebase Storage. This approach offers the following benefits:

1. **Simplicity**: All data is stored in one place - Firestore
2. **Free tier friendly**: Avoids using Firebase Storage service
3. **Direct access**: Images are retrieved alongside other property data in a single query

## Implementation Details

The application handles images in the following way:

1. Images are first validated for size (max 1MB per image)
2. If an image is too large, it's automatically optimized:
   - Resized to a maximum width of 1200px (maintaining aspect ratio)
   - Converted to JPEG format with 70% quality
3. The optimized image is converted to a Base64 string
4. The Base64 string is stored directly in the Firestore document

## Limitations and Considerations

### Document Size Limits

Firestore has a 1MB limit per document. To stay within this limit:

- Each image is limited to 1MB before optimization
- The system attempts to optimize large images automatically
- We recommend using a maximum of 5-7 images per property

### Performance Impact

Storing images as Base64 strings has some performance implications:

- **Document size**: Larger documents increase read/write costs
- **Bandwidth**: More data transfer when fetching properties
- **Client-side rendering**: Could be slower with many embedded images

### Cost Considerations

While this approach allows you to use the free tier, it's important to note:

- Free tier includes 1GB storage and 10GB/month bandwidth
- Storing images in documents consumes more reads/writes than references
- Consider monitoring your usage as your application grows

## Best Practices

1. **Image Optimization**: Always compress and resize images before uploading
2. **Lazy Loading**: Implement lazy loading for images in lists/grids
3. **Pagination**: Use pagination when displaying multiple properties
4. **Split Large Documents**: For properties with many images, consider storing them in separate documents

## Alternative Approaches

As your application grows, you might consider:

1. **Upgrade to Firebase Blaze Plan**: Use Firebase Storage for more cost-effective image storage
2. **External Image Storage**: Use services like Cloudinary or Imgix specifically designed for image hosting
3. **Hybrid Approach**: Store thumbnails in Firestore and full images elsewhere

## Deployment Instructions

When deploying, simply use:

```bash
firebase deploy --only firestore
```

No need to deploy storage rules since we're not using Firebase Storage.