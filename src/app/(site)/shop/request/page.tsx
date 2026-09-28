import type { Metadata } from 'next';
import VehicleRequestForm from './VehicleRequestForm';

export const metadata: Metadata = {
  title: 'Tell Us Your Bike — 3DThinkPro',
  description:
    'We make seat pads tailored to motorcycle models. If your model is not listed, submit your info and we will contact you once it becomes available.',
};

export default function VehicleRequestPage() {
  return (
    <div className="vehicle-request">
      <div className="vehicle-request-header">
        <h1 className="fs-32 fw-regular vehicle-request-title">Tell Us Your Bike</h1>
        <p className="vehicle-request-lead">
          We make seat pads tailored to motorcycle models. If your model is not listed, submit your
          info and we&apos;ll contact you once it becomes available.
        </p>
      </div>
      <VehicleRequestForm />
    </div>
  );
}
