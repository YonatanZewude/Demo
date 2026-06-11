import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '../components/layout/admin-layout'
import { PublicLayout } from '../components/layout/public-layout'
import { ProtectedRoute } from '../components/auth/protected-route'
import { AdminBookingsPage } from '../pages/admin-bookings-page'
import { AdminDashboardPage } from '../pages/admin-dashboard-page'
import { AdminGalleryPage } from '../pages/admin-gallery-page'
import { AdminOpeningHoursPage } from '../pages/admin-opening-hours-page'
import { AdminServicesPage } from '../pages/admin-services-page'
import { BookingPage } from '../pages/booking-page'
import { ContactPage } from '../pages/contact-page'
import { HomePage } from '../pages/home-page'
import { NotFoundPage } from '../pages/not-found-page'
import { ServicesPage } from '../pages/services-page'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="opening-hours" element={<AdminOpeningHoursPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}