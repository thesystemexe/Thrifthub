import { useDispatch, useSelector } from "react-redux";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import PageTitle from "../components/PageTitle";
import ProductCard from "../components/productCard/ProductCard";
import HeroSection from "./HeroSection";
import { useEffect } from "react";
import {
  removeErrors,
  userGetProducts,
} from "../features/products/productSlice";
import "../styles/home.css";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import FeaturedProducts from "./FeaturedProducts";

// const products = [
//   {
//     condition: {
//       grade: "A",
//       flaws: ["Minor fraying at the back hem"],
//       madeInCountry: "USA",
//       fabricComposition: "100% Cotton",
//     },
//     sizing: {
//       measurements: {
//         pitToPit: 0,
//         length: 42,
//         shoulderWidth: null,
//         sleeveLength: null,
//         waist: 31,
//         inseam: 32,
//       },
//       tagSize: "W32 L34",
//       actualFitSize: "31x32",
//     },
//     _id: "6aad1aa0c3ed24934875f2ca",
//     seller: "6aab69ad7d5594e11400f943",
//     title: "Vintage 90s Levi's 501 Denim Jeans 2",
//     category: "Bottoms",
//     genderCategory: "Unisex",
//     brand: "Levi's",
//     era: "90s",
//     description: "Classic straight-leg vintage denim in light wash condition.",
//     images: [
//       {
//         url: "https://res.cloudinary.com/douigbzqb/image/upload/v1789729440/product_images/uye7d5rfh1irp0ou5t0n.webp",
//         publicId: "product_images/uye7d5rfh1irp0ou5t0n",
//         _id: "6aad1aa0c3ed24934875f2cb",
//       },
//       {
//         url: "https://res.cloudinary.com/douigbzqb/image/upload/v1789729440/product_images/qz5bynrjoeqddl7upmnn.webp",
//         publicId: "product_images/qz5bynrjoeqddl7upmnn",
//         _id: "6aad1aa0c3ed24934875f2cc",
//       },
//       {
//         url: "https://res.cloudinary.com/douigbzqb/image/upload/v1789729440/product_images/f5qxs4dzgfhx04vl68eu.jpg",
//         publicId: "product_images/f5qxs4dzgfhx04vl68eu",
//         _id: "6aad1aa0c3ed24934875f2cd",
//       },
//     ],
//     price: 85,
//     status: "active",
//     numOfReviews: 1,
//     reviews: [
//       {
//         user: "6aab67321da53a42c259db2a",
//         name: "Harry",
//         rating: 5,
//         comment: "top product",
//         _id: "6aaf6194dde6dcbd96e1f65a",
//       },
//     ],
//     createdAt: "2026-09-18T11:04:00.852Z",
//     updatedAt: "2026-09-20T06:01:34.112Z",
//     __v: 2,
//     ratings: 5,
//     stock: 3,
//   },

//   {
//     condition: {
//       grade: "B",
//       flaws: ["Faded fabric and small pinhole near the front hem"],
//       madeInCountry: "USA",
//       fabricComposition: "100% Cotton",
//     },
//     sizing: {
//       measurements: {
//         pitToPit: 20.5,
//         length: 27,
//         shoulderWidth: 19,
//         sleeveLength: 8,
//         waist: 0,
//         inseam: 0,
//       },
//       tagSize: "L",
//       actualFitSize: "M",
//     },
//     ratings: 0,
//     _id: "6aad2deb47e8ff2835bd9ce3",
//     seller: "6aab69ad7d5594e11400f943",
//     title: "Vintage 80s Single Stitch Harley Davidson Graphic Tee",
//     category: "Tops",
//     genderCategory: "Men",
//     brand: "Harley Davidson",
//     era: "80s",
//     description:
//       "Authentic single stitch faded black graphic tee with eagle print on back.",
//     images: [],
//     price: 120,
//     status: "active",
//     numOfReviews: 0,
//     reviews: [],
//     createdAt: "2026-09-18T12:26:19.608Z",
//     updatedAt: "2026-09-18T12:26:19.608Z",
//     __v: 0,
//     stock: 2,
//   },
// ];

const Home = () => {
  const dispatch = useDispatch();
  const { products, productCount, error, isLoading } = useSelector(
    (store) => store.product,
  );

  useEffect(() => {
    dispatch(userGetProducts({ keyword: "" }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <PageTitle title="Home-My website" />
      <Header />
      <div className="Home-container">
        <HeroSection />
        <FeaturedProducts products={products} />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
