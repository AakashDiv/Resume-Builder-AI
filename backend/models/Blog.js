import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
    alt: { type: String, default: "" },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 180
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 220
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 320,
      default: ""
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    featuredImage: {
      type: imageSchema,
      default: () => ({})
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    tags: {
      type: [String],
      default: []
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 70,
      default: ""
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 170,
      default: ""
    },
    keywords: {
      type: [String],
      default: []
    },
    canonicalUrl: {
      type: String,
      trim: true,
      default: ""
    },
    focusKeyword: {
      type: String,
      trim: true,
      default: ""
    },
    ogTitle: {
      type: String,
      trim: true,
      maxlength: 95,
      default: ""
    },
    ogDescription: {
      type: String,
      trim: true,
      maxlength: 200,
      default: ""
    },
    ogImage: {
      type: String,
      trim: true,
      default: ""
    },
    schemaType: {
      type: String,
      trim: true,
      default: "Article"
    },
    author: {
      name: { type: String, trim: true, default: "NightHire.ai Editorial Team" },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true
    },
    readingTime: {
      type: Number,
      default: 1,
      min: 1
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1, publishedAt: -1 });
blogSchema.index({ tags: 1, status: 1, publishedAt: -1 });
blogSchema.index({
  title: "text",
  excerpt: "text",
  content: "text",
  category: "text",
  tags: "text",
  keywords: "text"
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
