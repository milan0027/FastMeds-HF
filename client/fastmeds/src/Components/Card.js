import React from 'react';

const Card = ({ store, ...props }) => {
  return (
    <div className="card mb-3" style={{ minWidth: '75%' }}>
      <div className="row g-0">
        <div>
          <div className="card-body">
            <div className="d-flex flex-column flex-md-row justify-content-between">
              <h5 className="card-title">Store Name: {store.name}</h5>
              <p className="card-text">Contact: {store.contact}</p>
            </div>
            <p className="card-text text-start">
              {store.address}, {store.city}
            </p>
            <div className="d-flex flex-column flex-md-row justify-content-between">
              <p className="card-text">
                <small className="text-muted">Estimated Distance: {store.distance}m</small>
              </p>
              <p className="card-text">
                <small className="text-muted">Estimated Duration: {store.duration}sec</small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
