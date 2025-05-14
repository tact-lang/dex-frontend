import { FC, useState } from 'react'

export interface FormField {
  name: string
  label: string
  type: string
  required: boolean
  description: string
  default?: string
}

export const onchainFormSpec: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, description: 'Token name' },
  { name: 'symbol', label: 'Symbol', type: 'text', required: true, description: 'Token symbol' },
  {
    name: 'decimals',
    label: 'Decimals',
    type: 'number',
    required: true,
    description: 'Token decimals',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    description: 'Token description',
  },
  {
    name: 'tokenImage',
    label: 'Token Image',
    type: 'url',
    required: false,
    description: 'Token logo URL',
  },
]

const MinterForm: FC = () => {
  const [formData, setFormData] = useState(
    onchainFormSpec.reduce((acc, field) => {
      acc[field.name] = field.default || ''
      return acc
    }, {} as Record<string, any>),
  )

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        className='preview'
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          border: '2px solid #ccc',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: '#f9f9f9',
        }}
      >
        <MinterPreview formData={formData} />
      </div>
      <div
        className='fields-preview'
        style={{
          position: 'absolute',
          top: '1rem',
          right: '180px',
          maxWidth: '200px',
          backgroundColor: '#333', // Darker background
          color: '#fff', // Contrasting text color
          border: '1px solid #444',
          borderRadius: '8px',
          padding: '1rem',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        }}
      >
        <h4 style={{ marginBottom: '0.5rem', color: '#fff' }}>Fields Preview</h4>
        {Object.entries(formData).map(([key, value]) => (
          <p
            key={key}
            style={{ fontSize: '0.9rem', margin: '0.2rem 0', color: '#ddd' }}
          >
            <strong>{key}:</strong> {value}
          </p>
        ))}
      </div>
      <form
        style={{
          marginTop: 'auto',
          marginBottom: 'auto',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
        }}
      >
        {onchainFormSpec.map((field) => (
          <div
            key={field.name}
            style={{ marginBottom: '1rem' }}
          >
            <label>
              {field.label}
              <input
                type={field.type}
                value={formData[field.name]}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                required={field.required}
                placeholder={field.description}
                style={{
                  display: 'block',
                  marginTop: '0.5rem',
                  marginBottom: '0.5rem',
                  width: '100%',
                }}
              />
            </label>
            <p style={{ marginTop: '0.5rem' }}>{field.description}</p>
          </div>
        ))}
      </form>
    </div>
  )
}

const MinterPreview: FC<{ formData: Record<string, any> }> = ({ formData }) => {
  return (
    <div style={{ textAlign: 'center' }}>
      {formData.tokenImage ? (
        <img
          src={formData.tokenImage}
          alt='Token Logo'
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <p style={{ fontSize: '0.8rem', color: '#666' }}>No Image</p>
      )}
    </div>
  )
}

export { MinterForm }
