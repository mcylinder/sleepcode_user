export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">About</span>{' '}
                  <span className="block text-[#4e88dd] xl:inline">SleepCoding</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover the story behind our mission to transform sleep into a powerful tool for personal growth and development.
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Our Mission */}
          <div className="mb-16">
            <div className="lg:text-center">
              <h2 className="text-base text-[#4e88dd] font-semibold tracking-wide uppercase">Our Mission</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Transforming Sleep into Growth
              </p>
            </div>
            <div className="mt-10">
              <div className="prose prose-lg text-gray-500 mx-auto">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
            </div>
          </div>

          {/* Our Story */}
          <div className="mb-16">
            <div className="lg:text-center">
              <h2 className="text-base text-[#4e88dd] font-semibold tracking-wide uppercase">Our Story</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                From Idea to Innovation
              </p>
            </div>
            <div className="mt-10">
              <div className="prose prose-lg text-gray-500 mx-auto">
                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
                  totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                </p>
                <p>
                  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores 
                  eos qui ratione voluptatem sequi nesciunt.
                </p>
              </div>
            </div>
          </div>

          {/* Our Approach */}
          <div className="mb-16">
            <div className="lg:text-center">
              <h2 className="text-base text-[#4e88dd] font-semibold tracking-wide uppercase">Our Approach</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Science Meets Innovation
              </p>
            </div>
            <div className="mt-10">
              <div className="prose prose-lg text-gray-500 mx-auto">
                <p>
                  At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti 
                  atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
                </p>
                <p>
                  Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. 
                  Et harum quidem rerum facilis est et expedita distinctio.
                </p>
              </div>
            </div>
          </div>

          {/* Our Team */}
          <div className="mb-16">
            <div className="lg:text-center">
              <h2 className="text-base text-[#4e88dd] font-semibold tracking-wide uppercase">Our Team</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Passionate Innovators
              </p>
            </div>
            <div className="mt-10">
              <div className="prose prose-lg text-gray-500 mx-auto">
                <p>
                  Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime 
                  placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
                </p>
                <p>
                  Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates 
                  repudiandae sint et molestiae non recusandae.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center">
            <h2 className="text-base text-[#4e88dd] font-semibold tracking-wide uppercase">Get In Touch</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Ready to Transform Your Sleep?
            </p>
            <div className="mt-8">
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#4e88dd] hover:bg-[#340c35] transition-colors duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
