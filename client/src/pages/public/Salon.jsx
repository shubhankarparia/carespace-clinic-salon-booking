import { Link } from 'react-router-dom';
import { services } from '../../data/demoData.js';
import { money } from '../../utils/format.js';
import "../../assets/styles/salon.css";

export default function Salon() {
  const salonServices = services.filter(
    service => service.category === 'salon'
  );

  return (
    <>
      <section className="page-hero salon-page-hero">
        <div className="container">
          <span className="eyebrow">BEAUTY & SELF CARE</span>
          <h1>Make time for<br />yourself.</h1>
          <p>
            Discover personalized salon services and enjoy
            a little time dedicated to you.
          </p>
          <Link to="/booking" className="btn btn-primary btn-lg mt-3">
            Book salon appointment
            <i className="bi bi-arrow-up-right ms-2" />
          </Link>
        </div>
      </section>

      <section className="section-space">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SALON SERVICES</span>
              <h2>Your self-care menu.</h2>
              <p>Find your next favorite treatment.</p>
            </div>
          </div>

          <div className="row g-4 mt-2">
            {salonServices.map(service => (
              <div className="col-md-4" key={service.id}>
                <div className="service-card">
                  <div className="service-icon">
                    <i className={`bi ${service.icon}`} />
                  </div>
                  <h4>{service.name}</h4>
                  <p>{service.description}</p>

                  <div className="service-card-bottom">
                    <strong>{money(service.price)}</strong>
                    <Link to={`/services/${service.id}`}>
                      Details <i className="bi bi-arrow-right" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}