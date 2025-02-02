import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faTwitter, faInstagram } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
    return (
      <footer className="text-white py-8 mt-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="flex justify-center space-x-6 mt-2">
                <a href="https://www.facebook.com/share/17MfbcR8C1/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 text-xl">
                    <FontAwesomeIcon icon={faFacebook} />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 text-xl">
                    <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 text-xl">
                    <FontAwesomeIcon icon={faInstagram} />
                </a>
            </div>
            <p className="mt-2 text-gray-400">Connecting home chefs with food lovers.</p>
          </div>
        <div className="text-center text-gray-500 text-sm pt-2">
          &copy; {new Date().getFullYear()} eFoodBD. All rights reserved.
        </div>
      </footer>
    );
  };
  
  export default Footer;
  