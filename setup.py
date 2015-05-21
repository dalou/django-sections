from setuptools import setup, find_packages

setup(
    name="django-sections",
    version = "1.0",
    url='http://github.com/dalou/django-cargo',
    license='BSD',
    platforms=['OS Independent'],
    description="Sections content managment",
    setup_requires = [
        'Ghost.py'
    ],
    install_requires = [
    ],
    long_description=open('README.md').read(),
    author='Damien Autrusseau',
    author_email='autrusseau.damien@gmail.com',
    maintainer='Damien Autrusseau',
    maintainer_email='autrusseau.damien@gmail.com',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    classifiers=[
        'Development Status :: Beta',
        'Framework :: Django',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Internet :: WWW/HTTP',
    ]
)
