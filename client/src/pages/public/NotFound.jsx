import { Link } from 'react-router-dom';
import "../../assets/styles/not-found.css";

export default function NotFound() {
  return (
    <section className="not-found">
      <div className="container text-center">
        <div className="not-found-icon">
          <i className="bi bi-compass" />
        </div>

        <span className="eyebrow">OOPS! PAGE NOT FOUND</span>

        <h1>404</h1>

        <h2>Looks like you're lost.</h2>

        <p>
          The page you are looking for may have been moved
          or does not exist.
        </p>

        <Link to="/" className="btn btn-primary btn-lg">
          <i className="bi bi-house me-2" />
          Back to homepage
        </Link>
      </div>
    </section>
  );
}