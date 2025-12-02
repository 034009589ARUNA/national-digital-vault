import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Toast from "./Toast"
import "./Login.css"

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "Citizen",
    agency: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Clean up form data - only send agency if role is GovernmentOfficer and agency is selected
    const submitData = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      role: formData.role,
      ...(formData.role === "GovernmentOfficer" && formData.agency ? { agency: formData.agency } : {})
    }

    const result = await register(submitData)

    if (result.success) {
      setToast({ message: "Registration successful! Redirecting...", type: "success" })
      setTimeout(() => navigate("/dashboard"), 1000)
    } else {
      setError(result.error)
      setToast({ message: result.error, type: "error" })
    }

    setLoading(false)
  }

  return (
    <div className="login-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="login-box">
        <h2>National Digital Document Vault</h2>
        <h3>Register</h3>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="Citizen">Citizen</option>
              <option value="GovernmentOfficer">Government Officer</option>
              <option value="Institution">Institution</option>
              <option value="Auditor">Auditor</option>
            </select>
          </div>
          {formData.role === "GovernmentOfficer" && (
            <div className="form-group">
              <label>Agency</label>
              <select name="agency" value={formData.agency} onChange={handleChange} required>
                <option value="">Select Agency</option>
                <option value="BirthDeaths">Birth & Deaths Office</option>
                <option value="LandRegistry">Land Registry</option>
                <option value="Education">Education Ministry</option>
                <option value="Immigration">Immigration</option>
                <option value="Courts">Courts</option>
              </select>
            </div>
          )}
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  )
}

export default Register
