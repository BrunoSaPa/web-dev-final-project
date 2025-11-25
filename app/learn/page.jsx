import Link from 'next/link';

export default function Learn() {
    return (
        <div className="container my-5">
            <h2 className="text-center mb-4 learn-text">Learn About Biodiversity</h2>

            <div className="row">
                <div className="col-12 col-sm-6 col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">The Importance of Pollinators</h5>
                            <p className="card-text">Discover why bees and bats are crucial for our ecosystems.</p>
                            <Link href="#" className="btn btn-primary">Read more</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">5 Actions You Can Take Today</h5>
                            <p className="card-text">Small changes in your daily life that have a big impact on the planet.</p>
                            <Link href="#" className="btn btn-primary">Read more</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">Understanding Food Webs</h5>
                            <p className="card-text">Learn how every species, big or small, plays a role in the food web.</p>
                            <Link href="#" className="btn btn-primary">Read more</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">The Threat of Invasive Species</h5>
                            <p className="card-text">Find out how non-native species can disrupt local ecosystems.</p>
                            <Link href="#" className="btn btn-primary">Read more</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">Success Stories in Conservation</h5>
                            <p className="card-text">Read about species that have been brought back from the brink of extinction.</p>
                            <Link href="#" className="btn btn-primary">Read more</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 shadow">
                        <div className="card-body">
                            <h5 className="card-title">How Climate Change Affects Wildlife</h5>
                            <p className="card-text">Explore the connection between global warming and habitat loss.</p>
                            <Link href="#" className="btn btn-primary">Read more</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
