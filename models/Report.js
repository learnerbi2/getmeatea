// models/Report.js
import mongoose from "mongoose"

const ReportSchema = new mongoose.Schema({
    reportedUsername: { type: String, required: true },
    reportedBy:       { type: String, required: true }, // email
    reason:           { type: String, required: true },
    status:           { 
        type:    String, 
        enum:    ["pending", "reviewed", "resolved", "dismissed"],
        default: "pending"
    },
    details:          { type: String, default: "" },
}, { timestamps: true })

export default mongoose.models.Report || 
    mongoose.model("Report", ReportSchema)