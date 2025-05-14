import { FC } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Layout } from './layout'
import { MinterPage } from './pages/MinterPage'

const App: FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path='/minter'
            element={<MinterPage />}
          />
        </Routes>
      </Layout>
    </Router>
  )
}

export { App }
