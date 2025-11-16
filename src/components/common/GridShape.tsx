import loginImg from "../images/loginImg.jpg";
export default function GridShape() {
  return (
    <>
      <div
        className="
          absolute
          right-0
          top-0
          -z-1
          w-full
          max-w-[900px]
          xl:max-w-[900px]
          transform
          -translate-y-48
          -translate-x-10
        "
      >
        <img
          src={loginImg}
          alt="grid"
          className="w-full h-auto object-contain"
        />
      </div>
    </>
  );
}
